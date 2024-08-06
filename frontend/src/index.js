import React from 'react';
import ReactDOM from 'react-dom/client';

import type {Defensive, Job} from "./jobs";
import {jobByCode, jobs} from "./jobs";
import type {Fight} from "./fights";
import {fights} from "./fights"

import "./index.css"

class JobToggle extends React.Component {
    render() {
        return <li><img
            alt={this.props.friendlyName}
            id={this.props.code + "_toggle"}
            className={"jobtoggle " + (this.props.active ? "active" : "inactive")}
            src={"/" + this.props.code + ".png"}
            onClick={this.props.toggle}/></li>;
    }

}

class JobBar extends React.Component {

    constructor(props) {
        super(props);
        const preselect = props.selected || []
        let state = props.jobs.reduce((accu, next) => {
            accu[next.code] = preselect.indexOf(next.code) >= 0
            return accu
        }, {});
        this.state = state
        this.checkFullParty(state)
    }

    checkFullParty(selected) {
        const activeJobs = this.props.jobs.filter(j => selected[j.code])
        if (activeJobs.length === 8) {
            // full party, let's go
            this.props.onPartySelected(activeJobs)
        } else {
            this.props.onPartySelected(null)
        }
    }

    toggleJob(code: string) {
        const previousState = this.state[code]
        let activeCount = Object.keys(this.state).reduce((count, next) => count + (this.state[next] ? 1 : 0), 0);

        if (!previousState && activeCount >= 8) {
            return
        }

        const newToggles = {
            ...this.state,
        }
        newToggles[code] = !previousState
        this.setState(newToggles)
        this.checkFullParty(newToggles)
    }

    render() {
        let jobToggles = this.props.jobs.map(({code, friendlyName}) => React.createElement(JobToggle, {
            toggle: () => {
                this.toggleJob(code)
            }, key: code, active: this.state[code], code, friendlyName
        }));
        return <ul className="toggle_container">
            {jobToggles}
        </ul>
    }
}

class FightSelector extends React.Component {

    render() {
        const fightOptions = this.props.fights.map((f, i) => <option key={"f_" + i}
                                                                     value={"fight_" + i}>{f.name}</option>)
        const selectedIndex = this.props.fights.indexOf(this.props.selected)
        return <select className="fightSelectDropdown"
                       onChange={e => this.props.onFightSelected(this.props.fights[e.target.selectedIndex])}
                       value={"fight_" + selectedIndex}>
            {fightOptions}
        </select>
    }
}

function formatTime(seconds: number) {
    return Math.floor(seconds / 60) + ":" + (seconds % 60)
}

class JobActionCell extends React.Component {

    constructor() {
        super();
        this.state = {
            addOverlayVisible: false
        }
    }

    render() {
        const {actions, level, job, combatEvent} = this.props;
        const myActions = actions.filter(({timestamp, by}) => timestamp === combatEvent.timestamp && by === job.code)
        const learnedActions = job.actions
            .filter(action => action.atLevel <= level)
        const evolvedActions = learnedActions.map(action => {
            while (action.evolution) {
                if (action.evolution.atLevel > level) {
                    return action
                }

                action = action.evolution
            }
            return action
        })
        const potentialActions = evolvedActions.filter(action => {
            const found = actions.find(({timestamp, by, ability}) => {
                const deltaT = timestamp - combatEvent.timestamp
                return by === job.code &&
                    ability === action &&
                    deltaT >= -ability.cooldownSeconds &&
                    deltaT <= ability.cooldownSeconds
            })

            return !found
        })
        return <span>{
            myActions.map(action => {
                const {icon, name} = action.ability
                return <img key={job.code + "_" + name} src={icon} alt={name} width="32" height="32"
                            onClick={() => this.props.removeHandler(action)}/>
            })

        }
            <span className="add" onClick={() =>
                this.setState({addOverlayVisible: true})
            }>+</span>
            {
                this.state.addOverlayVisible ?
                    <div className="addOverlay">{
                        potentialActions.map(action => {
                            const {icon, name} = action
                            return <img key={job.code + "_" + name} src={icon} alt={name} width="32" height="32"
                                        onClick={() => {
                                            this.props.addHandler({
                                                timestamp: combatEvent.timestamp,
                                                by: job.code,
                                                ability: action
                                            })
                                            this.setState({addOverlayVisible: false})
                                        }
                                        }/>
                        })
                    }</div> :
                    ""
            }
        </span>;
    }
}

class FightActionGrid extends React.Component {
    render() {
        return <table id="actionGrid">
            <thead>
            <tr>
                <th>Action</th>
                <th>Timestamp</th>
                <th>Type</th>
                <th>Raw Damage</th>
                {this.props.jobs.map(({code, friendlyName}) => <th key={code}>{friendlyName}</th>)}
            </tr>
            </thead>
            <tbody>
            {
                this.props.fight.events.map(event => {
                    return <tr key={"_" + event.timestamp}>
                        <td>{event.name}</td>
                        <td>{formatTime(event.timestamp)}</td>
                        <td>{event.damageType !== "AVOIDABLE" ? event.damageType : ""}</td>
                        <td>{event.rawDamage > 0 ? event.rawDamage : ""}</td>
                        {
                            this.props.jobs.map(job => {
                                return <td key={job.code}><JobActionCell combatEvent={event} job={job}
                                                                         level={this.props.fight.levelSync}
                                                                         actions={this.props.actions}
                                                                         addHandler={this.props.addHandler}
                                                                         removeHandler={this.props.removeHandler}
                                /></td>
                            })
                        }
                    </tr>
                })
            }
            </tbody>
        </table>;
    }
}

interface CombatAction {
    timestamp: number,
    by: string,
    ability: Defensive
}

class Application extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            party: null, fight: fights[0], actions: [{
                timestamp: 15,
                by: "SCH",
                ability: jobs.byCode("SCH").actions[0]
            }]
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
