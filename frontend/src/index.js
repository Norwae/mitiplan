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

class Application extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            party: props.party || null, fight: props.fight || fights[0], actions: props.actions || []
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
        if ((party && !this.state.party) || (!party && this.state.party)) {
            this.setState({
                party
            })
            console.log("Party set up", party)
        }
    }

    setFight(fight: Fight) {
        this.setState({fight})
    }

    render() {
        const canRender = this.state.party && this.state.fight;
        return <div id="approot">
            <div id="headerbar">
                <FightSelector fights={fights} onFightSelected={f => this.setFight(f)} selected={this.state.fight}/>
                <JobBar jobs={jobs} onPartySelected={p => this.setParty(p)} selected={this.state.party}/>
            </div>
            {canRender ? <FightActionGrid fight={this.state.fight} jobs={this.state.party} actions={this.state.actions}
                                          addHandler={ca => this.addAction(ca)}
                                          removeHandler={ca => this.removeAction(ca)}/> :
                <h1>No fight and party combination set </h1>

            }
        </div>
    }
}

const rootElement = document.getElementById("root");
console.log(rootElement)
const root = ReactDOM.createRoot(rootElement)
root.render(<Application/>)
