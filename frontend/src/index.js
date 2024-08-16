import React from 'react';
import ReactDOM from 'react-dom/client';

import type {Ability, Job} from "./jobs";
import {jobs} from "./jobs";
import {JobBar} from "./jobbar";
import {FightSelector} from "./fightselector";
import {FightActionGrid} from "./fightgrid";
import type {Fight} from "./fights";
import {fights} from "./fights"

import "./index.css"
import {CombatAction} from "./fightgrid";
import {PersistenceModel} from "./persistence";


class Application extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            party: null,
            fight: null,
            fightEvents: [],
            actions:[]
        }

        if (props.plan) {
            this.reset()
        } else {
            this.setFight(props.fight || fights[0])
        }

    }

    addAction(action: CombatAction) {
        this.setState({
            actions: [action, ...this.state.actions]
        })
    }

    removeAction(action: CombatAction) {
        this.setState({actions: this.state.actions.filter(a => a !== action)})
    }

    setParty(party: Job[]) {
        if (party && party.length !== 8){
            party = null
        }
        this.setState({party})
    }

    async setFight(fight: Fight) {
        const fightEvents = await fight.events()
        this.setState({fight, fightEvents, actions: []})
    }

    async reset() {
        const plan = this.props.plan.substring(1)
        const {fight, party, actions} = await PersistenceModel.load(plan)
        const fightEvents = await fight.events()
        this.setState({fight, party, actions, fightEvents})
    }

    async export() {
        if (this.state.party) {
            let key = await new PersistenceModel(this.state.party, this.state.actions, this.state.fight).store()
            window.location.hash = key
            await navigator.clipboard.writeText(window.location)
        }
    }

    canRender(): boolean {
        return this.state.party && this.state.fightEvents && this.state.fight
    }

    render() {
        return <div id="approot">
            <div id="headerbar">
                <FightSelector onFightSelected={f => this.setFight(f)} selected={this.state.fight}/>
                <JobBar onPartySelected={p => this.setParty(p)} selected={this.state.party}/>
                <div className="persistenceControl">
                    <button onClick={() => this.reset()}>↺</button>
                    <button onClick={() => this.export()}>🔗</button>
                </div>
            </div>
            {this.canRender() ? <FightActionGrid fight={this.state.fightEvents} jobs={this.state.party}
                                                 actions={this.state.actions} levelSync={this.state.fight.levelSync}
                                          addHandler={ca => this.addAction(ca)}
                                          removeHandler={ca => this.removeAction(ca)}/> :
                <div className="unreadyInfo">
                    <b>No fight / Party selected</b>
                    <p>Make sure you select exactly 8 jobs, and a fight from the dropdown</p>
                </div>

            }
        </div>
    }
}

const rootElement = document.getElementById("root");
const initialPlan = document.location.hash
console.log(rootElement)
const root = ReactDOM.createRoot(rootElement)
root.render(<Application plan={initialPlan}/>)
