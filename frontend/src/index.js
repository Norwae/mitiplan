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
import {toast, Toaster} from "react-hot-toast";


class Application extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            party: null,
            fight: null,
            fightEvents: [],
            actions: [],
            loading: false,
            dirty: false
        }

        setTimeout(() => {
            if (props.plan) {
                this.reset()
            } else {
                this.setFight(props.fight || fights[0])
            }

            setInterval(this.export.bind(this, false), 5000)
        }, 50)
    }

    addAction(action: CombatAction) {
        this.setState({
            actions: [action, ...this.state.actions],
            dirty: true
        })
    }

    removeAction(action: CombatAction) {
        this.setState({
            actions: this.state.actions.filter(a => a !== action),
            dirty: true
        })
    }

    setParty(party: Job[]) {
        if (party && party.length !== 8) {
            party = null
        }
        this.setState({party, dirty: true})
    }

    async setFight(fight: Fight) {
        this.setState({loading: true})
        const fightEvents = await fight.events()
        this.setState({fight, fightEvents, actions: [], loading: false})
    }

    async reset() {
        this.setState({loading: true})
        const plan = this.props.plan.substring(1)
        let data: { fight: Fight, party: Job[], actions: CombatAction[] };
        if (plan) {
            data = await PersistenceModel.load(plan)
        } else {
            const fight = fights[0]
            data = {fight, party: null, actions: []}
        }
        const {fight, party, actions} = data;
        const fightEvents = await fight.events();
        this.setState({fight, party, actions, fightEvents, loading: false, dirty: false})
        if (plan) {
            window.location.hash = plan
        }
    }

    async export(toClip: boolean) {
        if (this.state.party && this.state.dirty) {
            let key = await new PersistenceModel(this.state.party, this.state.actions, this.state.fight).store()
            window.location.hash = key
            if (toClip) {
                await navigator.clipboard.writeText(window.location)
                toast('Shareable link copied', {icon: '🔗'})
            }
        }
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

            <div id="headerbar">
                <FightSelector onFightSelected={f => this.setFight(f)} selected={this.state.fight}/>
                <JobBar onPartySelected={p => this.setParty(p)} selected={this.state.party}/>
                <div className="persistenceControl">
                    <button onClick={() => this.reset()}>↺</button>
                    <button onClick={() => this.export(true)}>🔗</button>
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
const root = ReactDOM.createRoot(rootElement)
root.render(<Application plan={initialPlan}/>)
