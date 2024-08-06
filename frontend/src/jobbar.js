import React from "react";

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

export class JobBar extends React.Component {

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
