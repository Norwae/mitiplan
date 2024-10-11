import React, {useMemo, useState} from "react";
import type {Ability} from "./jobs";

import './fightgrid.css'
import JobTimeline from "./jobtimeline";


export class CombatAction {
    timestamp: number
    by: string
    ability: Ability

    constructor(timestamp: number, by: string, ability: Ability) {
        this.timestamp = timestamp
        this.by = by;
        this.ability = ability
    }

    isEqual(other: CombatAction) {
        return this.timestamp === other.timestamp && this.by === other.by && this.ability.atLevel === other.ability.atLevel
    }
}

function SelectableActions({actions, handler}) {
    return <span>{actions.map(action => {
        const {icon, name} = action.ability
        return <img key={name} src={icon} alt={name} width="32" height="32" title={name}
                    onClick={() => handler(action)}/>
    })}</span>
}

const formatTime = (seconds) => Math.floor(seconds / 60) + ":" + ("0" + (seconds % 60)).slice(-2)

function JobEventCell({timeline, event, onUpdateTimeline}) {
    const [expanded, setExpanded] = useState(false)
    const actions = timeline.actionsAt(event.timestamp);
    return <div>
        <SelectableActions actions={actions} handler={action => onUpdateTimeline(timeline.removeAction(action))}/>
        {expanded ?
            <div className="addOverlay">
                <SelectableActions
                    actions={timeline.availableAbilities(event.timestamp).map(ability => new CombatAction(event.timestamp, timeline.job.code, ability))}
                    handler={action => {
                        onUpdateTimeline(timeline.addAction(action))
                        setExpanded(false)
                    }}/>
                <span className="action cancelAdd"
                      onClick={() => setExpanded(false)}>&#8854;</span>
            </div> :
            <span className="action add" onClick={() => setExpanded(true)}>&#8853;</span>}
    </div>
}

const JobTimelineColumn = React.memo(({timeline, fight, onUpdateTimeline}) => {
    return <div className="actionGridColumn jobColumn">
        <div><img alt={timeline.job.friendlyName} src={'./' + timeline.job.code + ".png"} className="jobIcon"/></div>
        {
            fight.map((evt, i) => <JobEventCell key={i} timeline={timeline} event={evt}
                                                onUpdateTimeline={onUpdateTimeline}/>)
        }
    </div>
})

export function FightActionGrid({events, level, timelines, onUpdateTimeline}) {
    return <div id="actionGrid">
        <div className="actionGridColumn metaColumn">
            <div>Event</div>
            {
                events.map(({name}, i) => <div key={i}>{name}</div>)
            }
        </div>
        <div className="actionGridColumn metaColumn">
            <div>Time</div>
            {
                events.map(({timestamp}, i) => <div key={i}>{formatTime(timestamp)}</div>)
            }
        </div>
        <div className="actionGridColumn metaColumn">
            <div>Damage</div>
            {
                events.map(({rawDamage, damageType}, i) => {
                    if (rawDamage > 0 && damageType !== "AVOIDABLE") {
                        return <div key={i}>{rawDamage}<img alt={damageType} src={"/DMG_" + damageType + ".png"}
                                                            className="damageIndicator"/></div>
                    } else {
                        return <div key={i}/>
                    }
                })
            }
        </div>
        {
            Object.keys(timelines).map(jobCode => <JobTimelineColumn key={jobCode} timeline={timelines[jobCode]} fight={events}
                                                onUpdateTimeline={onUpdateTimeline}/>)
        }
    </div>
}

