import React from "react";
import type {Ability} from "./jobs";

import './fightgrid.css'


export class CombatAction {
    timestamp: number
    by: string
    ability: Ability

    constructor(timestamp: number, by: string, ability: Ability) {
        this.timestamp = timestamp
        this.by = by;
        this.ability = ability
    }
}

class SelectableActions extends React.Component {
    render() {
        return <span>{this.props.actions.map(action => {
            const {icon, name} = action.ability
            return <img key={name} src={icon} alt={name} width="32" height="32" title={name}
                        onClick={() => this.props.handler(action)}/>
        })}</span>
    }
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
            const found = actions.filter(({timestamp, by, ability}) => {
                const deltaT = timestamp - combatEvent.timestamp
                return by === job.code && ability === action && deltaT >= -ability.cooldownSeconds && deltaT <= ability.cooldownSeconds
            }).length

            return action.charges > found
        }).map(action => ({
            timestamp: combatEvent.timestamp,
            by: this.props.job.code,
            ability: action
        }))
        return <span>
            <SelectableActions actions={myActions} handler={this.props.removeHandler}/>
            {this.state.addOverlayVisible ?
                <div className="addOverlay">
                    <SelectableActions actions={potentialActions} handler={action => {
                        this.props.addHandler(action)
                        this.setState({addOverlayVisible: false})
                    }}/>
                    <span className="action cancelAdd"
                          onClick={() => this.setState({addOverlayVisible: false})}>&#8854;</span>
                </div> :
                <span className="action add" onClick={() => this.setState({addOverlayVisible: true})}>&#8853;</span>}
        </span>;
    }
}

const formatTime = (seconds) => Math.floor(seconds / 60) + ":" + ("0" + (seconds % 60)).slice(-2)

export class FightActionGrid extends React.Component {
    render() {
        return <table id="actionGrid">
            <thead>
            <tr>
                <th className="action">Event</th>
                <th className="timestamp">Time</th>
                <th className="type">Damage</th>
                {this.props.jobs.map(({code}) => <th key={code}><img src={'./' + code + ".png"}/></th>)}
            </tr>
            </thead>
            <tbody>
            {this.props.fight.map((event, idx) => {
                return <tr key={"_" + idx}>
                    <td className="action">{event.name}</td>
                    <td className="timestamp">{formatTime(event.timestamp)}</td>
                    <td className="type">{event.rawDamage > 0 ?
                        <span>{event.rawDamage}<img alt={event.damageType} src={"/DMG_" +event.damageType + ".png"} width="16" height="16"/></span>: ""}</td>
                    {this.props.jobs.map(job => {
                        return <td className="abilityCell" key={job.code}><JobActionCell combatEvent={event} job={job}
                                                                 level={this.props.levelSync}
                                                                 actions={this.props.actions}
                                                                 addHandler={this.props.addHandler}
                                                                 removeHandler={this.props.removeHandler}
                        /></td>
                    })}
                </tr>
            })}
            </tbody>
        </table>;
    }
}
