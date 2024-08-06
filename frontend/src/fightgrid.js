import React from "react";

class SelectedActions extends React.Component {
    render() {
        return <span>{this.props.actions.map(action => {
            const {icon, name} = action.ability
            return <img key={name} src={icon} alt={name} width="32" height="32"
                        onClick={() => this.props.removeHandler(action)}/>
        })}</span>
    }
}

class PotentialActions extends React.Component {

    render() {
        return <span>{
            this.props.actions.map(action => {
                const {icon, name} = action
                return <img key={name} src={icon} alt={name} width="32" height="32"
                            onClick={() => {
                                this.props.addHandler(action)
                            }}/>
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
        })
        return <span>
            <SelectedActions actions={myActions} removeHandler={this.props.removeHandler}/>
            {this.state.addOverlayVisible ?
                <div className="addOverlay">
                    <PotentialActions actions={potentialActions} addHandler={(action) => {
                        this.setState({addOverlayVisible: false})
                        this.props.addHandler({
                            timestamp: combatEvent.timestamp, by: this.props.job.code, ability: action
                        })
                    }}/>
                    <span className="cancelAdd" onclick={() => this.setState({addOverlayVisible: false})}>-</span>
                </div> :
                <span className="add" onClick={() => this.setState({addOverlayVisible: true})}>+</span>}
        </span>;
    }
}

const formatTime = (seconds) => Math.floor(seconds / 60) + ":" + (seconds % 60)

export class FightActionGrid extends React.Component {
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
            {this.props.fight.events.map(event => {
                return <tr key={"_" + event.timestamp}>
                    <td>{event.name}</td>
                    <td>{formatTime(event.timestamp)}</td>
                    <td>{event.damageType !== "AVOIDABLE" ? event.damageType : ""}</td>
                    <td>{event.rawDamage > 0 ? event.rawDamage : ""}</td>
                    {this.props.jobs.map(job => {
                        return <td key={job.code}><JobActionCell combatEvent={event} job={job}
                                                                 level={this.props.fight.levelSync}
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
