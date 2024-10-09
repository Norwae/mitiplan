import React from "react";
import {jobs} from "./jobs";

import './jobbar.css'

class JobToggle extends React.Component {
    render() {
        return <li onClick={(evt) => this.props.toggle()} className={this.props.active ? "active": "inactive"}>
            <img src={"/" + this.props.code + ".png"} alt={this.props.friendlyName}/>
            <span>{this.props.friendlyName}</span>
        </li>;
    }

}

export class JobBar extends React.Component {

    constructor(props) {
        super(props);
        const state = this.rebuildState(props.selected);
        this.state = state
        this.checkFullParty(state)
    }

    rebuildState(selected) {
        selected = (selected || []).map(job => job.code)
        return jobs.reduce((accu, next) => {
            accu[next.code] = selected.indexOf(next.code) >= 0
            return accu
        }, {});
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!prevProps.selected && !!this.props.selected) {
            this.setState(this.rebuildState(this.props.selected))
        }
    }

    checkFullParty(state) {
        const activeJobs = jobs.filter(j => state[j.code])
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
        return <ul className="toggle_container">
            {jobs.map(({code, friendlyName}) =>
                <JobToggle friendlyName={friendlyName} code={code} active={this.state[code]} key={code}
                           toggle={() => this.toggleJob(code)}/>)}
        </ul>
    }
}
