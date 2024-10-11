import React, {useState} from 'react';
import ReactDOM from 'react-dom/client';

import type {Job} from "./jobs";
import {JobBar} from "./jobbar";
import {FightSelector} from "./fightselector";
import {CombatAction, FightActionGrid} from "./fightgrid";
import {Fight, fights} from "./fights"

import "./index.css"
import {PersistenceModel} from "./persistence";
import {PersistenceControl} from './persistencecontrol'
import {Toaster} from "react-hot-toast";
import type {CombatEvent} from "./fights";
import JobTimeline from "./jobtimeline";


function Application() {
    const [fight, setFight] = useState(null)
    const [fightEvents, setFightEvents] = useState(null)
    const [loading, setLoading] = useState(true)
    const [dirty, setDirty] = useState(false)
    const [timelines, setTimelines] = useState(null)


    async function initFight(fight: Fight, party?: Job[], actions?: CombatAction[]) {
        setLoading(true)
        setFight(fight)
        setFightEvents(await fight.events())

        if (party?.length === 8) {
            setTimelines(party.reduce((acc, job) => ({
                ...acc,
                [job.code]: new JobTimeline(job, fight.levelSync, actions)
            }), {}))
        } else {
            setTimelines(null)
        }

        setLoading(false)
        setDirty(false)
    }

    function marshall(explicit?: boolean) {
        if (!explicit && !dirty) {
            return "UNCHANGED"
        }

        if (fight && timelines) {
            setDirty(false)
            return new PersistenceModel(party(), actions(), fight)
        } else {
            return null
        }
    }

    async function unmarshall(data: PersistenceModel) {
        setLoading(true)

        const {fight, party, actions} = data;
        await initFight(fight, party, actions)
    }

    function canRender(): boolean {
        return timelines && fightEvents && fight
    }

    function party() {
        if (!timelines) return null
        return Object.keys(timelines).map(code => timelines[code].job);
    }

    function actions() {
        return party()?.reduce((acc, job) => acc.concat(timelines[job.code].actions), [])
    }

    return <div id="approot">
        <Toaster/>
        <div id="loader" className={loading ? "active" : ""}>
            <div id="loaderText">Loading data, please wait</div>
        </div>
        <div id="main">
            <PersistenceControl marshall={marshall}
                                unmarshall={unmarshall}/>
            <FightSelector onFightSelected={f => initFight(f)} selected={fight}/>
            <JobBar onPartySelected={p => initFight(fight, p)} party={party()}/>
            <div id="primaryTableArea">
                {canRender() ?
                    <FightActionGrid level={fight.levelSync} events={fightEvents} timelines={timelines}
                                     onUpdateTimeline={tl => {
                                         setTimelines({
                                             ...timelines,
                                             [tl.job.code]: tl
                                         })
                                     }}
                    /> :
                    <div className="unreadyInfo">
                        <b>No fight / Party selected</b>
                        <p>Make sure you select exactly 8 jobs, and a fight from the dropdown</p>
                    </div>

                }</div>
        </div>
    </div>
}


const
    rootElement = document.getElementById("root");
const
    initialPlan = document.location.hash
const
    root = ReactDOM.createRoot(rootElement)
root
    .render(
        <Application plan={
            initialPlan
        }/>)

setTimeout(
    PersistenceControl.initialLoad, 10
)
