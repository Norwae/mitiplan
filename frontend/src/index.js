import React from 'react';
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


class Application extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            party: null, fight: fights[0], fightEvents: [], actions: [], loading: false, dirty: false
        }

    }

    addAction(action: CombatAction) {
        this.setState({
            actions: [action, ...this.state.actions], dirty: true
        })
    }

    removeAction(action: CombatAction) {
        this.setState({
            actions: this.state.actions.filter(a => a !== action), dirty: true
        })
    }

    setParty(party: Job[]) {
        let expectedPartySize = this.state.fight?.partySize || 8

        if (party && party.length !== expectedPartySize) {
            party = null
        }
        this.setState({party, dirty: true})
    }

    async setFight(fight: Fight) {
        this.setState({loading: true})
        const fightEvents = await fight.events()
        this.setState({fight, fightEvents, actions: [], loading: false})
    }

    marshall() {
        if (!this.state.dirty) {
            return "UNCHANGED"
        }

        if (this.state.fight  && this.state.party) {
            return new PersistenceModel(this.state.party, this.state.actions, this.state.fight)
        } else {
            return null
        }
    }

    async unmarshall(data: PersistenceModel) {
        this.setState({loading: true})

        const {fight, party, actions} = data;
        const fightEvents = await fight.events();
        this.setState({fight, party, actions, fightEvents, loading: false, dirty: false})
    }

    canRender(): boolean {
        return this.state.party && this.state.fightEvents && this.state.fight
    }

    render() {
        return <div id="approot">
            <Toaster/>
            <div id="loader" className={this.state.loading ? "active" : ""}>
                <div id="loaderText">Loading data, please wait</div>
            </div>
            <div id="main">
                <PersistenceControl marshall={() => this.marshall()} unmarshall={(persistenceModel) => this.unmarshall(persistenceModel)}/>
                <FightSelector onFightSelected={f => this.setFight(f)} selected={this.state.fight}/>
                <JobBar onPartySelected={p => this.setParty(p)} party={this.state.party}/>
                <div id="primaryTableArea">
                    {this.canRender() ? <FightActionGrid fight={this.state.fightEvents} jobs={this.state.party}
                                                         actions={this.state.actions}
                                                         levelSync={this.state.fight.levelSync}
                                                         addHandler={ca => this.addAction(ca)}
                                                         removeHandler={ca => this.removeAction(ca)}/> :
                        <div className="unreadyInfo">
                            <b>No fight / Party selected</b>
                            <p>Make sure you select exactly {this.state.fight?.partySize || 8} jobs, and a fight from the dropdown</p>
                        </div>

                    }</div>
            </div>
        </div>
    }
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
