import React, {useMemo, useState} from "react";
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

function SelectableActions({actions, handler}) {
    return <span>{actions.map(action => {
        const {icon, name} = action.ability
        return <img key={name} src={icon} alt={name} width="32" height="32" title={name}
                    onClick={() => handler(action)}/>
    })}</span>
}

function JobActionCell({actions, level, job, combatEvent, addHandler, removeHandler}) {
    const [addOverlayVisible, setAddOverlayVisible] = useState(false)
    function calculateActions(): [CombatAction[], CombatAction[]] {
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
            by: job.code,
            ability: action
        }))
        return [myActions, potentialActions]
    }

    const [myActions, potentialActions] = useMemo(calculateActions, [actions, job, combatEvent])

    return <span>
            <SelectableActions actions={myActions} handler={removeHandler}/>
        {addOverlayVisible ?
            <div className="addOverlay">
                <SelectableActions actions={potentialActions} handler={action => {
                    addHandler(action)
                    setAddOverlayVisible(false)
                }}/>
                <span className="action cancelAdd"
                      onClick={() => setAddOverlayVisible(false)}>&#8854;</span>
            </div> :
            <span className="action add" onClick={() => setAddOverlayVisible(true)}>&#8853;</span>
        }
        </span>;
}


const formatTime = (seconds) => Math.floor(seconds / 60) + ":" + ("0" + (seconds % 60)).slice(-2)

export function FightActionGrid({jobs, fight, levelSync,actions, addHandler, removeHandler}) {
    return <table id="actionGrid">
        <thead>
        <tr>
            <th className="action">Event</th>
            <th className="timestamp">Time</th>
            <th className="type">Damage</th>
            {jobs.map(({code, friendlyName}) => <th key={code}><img alt={friendlyName} src={'./' + code + ".png"}/></th>)}
        </tr>
        </thead>
        <tbody>
        {fight.map((event, idx) => {
            return <tr key={"_" + idx}>
                <td className="action">{event.name}</td>
                <td className="timestamp">{formatTime(event.timestamp)}</td>
                <td className="type">{event.rawDamage > 0 && event.damageType !== "AVOIDABLE" ?
                    <span>{event.rawDamage}<img alt={event.damageType} src={"/DMG_" + event.damageType + ".png"}
                                                className="damageIndicator"/></span> : ""}</td>
                {jobs.map(job => {
                    return <td className="abilityCell" key={job.code}>
                        <JobActionCell combatEvent={event} job={job}
                                       level={levelSync}
                                       actions={actions}
                                       addHandler={addHandler}
                                       removeHandler={removeHandler}
                        />
                    </td>
                })}
            </tr>
        })}
        </tbody>
    </table>;
}

