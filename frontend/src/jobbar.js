import React from "react";
import {jobs} from "./jobs";

class JobToggle extends React.Component {
    render() {
        return <li><img
            alt={this.props.friendlyName}
            id={this.props.code + "_toggle"}
            width="64"
            height="64"
            className={"jobtoggle " + (this.props.active ? "active" : "inactive")}
            src={"/" + this.props.code + ".png"}
            onClick={this.props.toggle}/></li>;
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
