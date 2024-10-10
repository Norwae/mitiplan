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


function Application() {
    const [party, setParty] = useState(null)
    const [fight, setFight] = useState(fights[0])
    const [actions, setActions] = useState([])
    const [fightEvents, setFightEvents] = useState([])
    const [loading, setLoading] = useState(false)
    const [dirty, setDirty] = useState(false)

    function addAction(action: CombatAction) {
        setActions([action, ...actions])
        setDirty(true)
    }

    function removeAction(action: CombatAction) {
        setActions(actions.filter(a => a !== action))
        setDirty(true)
    }

    async function initFight(fight: Fight, actions?: CombatAction[]) {
        setLoading(true)
        setFight(fight)
        setFightEvents(await fight.events())
        setActions(actions || [])
        setLoading(false)
        setDirty(false)
    }

    function marshall() {
        if (!dirty) {
            return "UNCHANGED"
        }

        if (fight && party) {
            return new PersistenceModel(party, actions, fight)
        } else {
            return null
        }
    }

    async function unmarshall(data: PersistenceModel) {
        setLoading(true)

        const {fight, party, actions} = data;
        setParty(party)
        await initFight(fight, actions)
    }

    function canRender(): boolean {
        return party && fightEvents && fight
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
            <JobBar onPartySelected={p => setParty(p)} party={party}/>
            <div id="primaryTableArea">
                {canRender() ? <FightActionGrid fight={fightEvents} jobs={party}
                                                     actions={actions}
                                                     levelSync={fight.levelSync}
                                                     addHandler={ca => addAction(ca)}
                                                     removeHandler={ca => removeAction(ca)}/> :
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
