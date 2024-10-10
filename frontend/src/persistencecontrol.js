import React from "react";

import HoverBubble from "./hoverbubble";
import './persistencecontrol.css'

export class PersistenceControl extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div className="persistenceControl">
            <div><button onClick={this.props.onReset}>↺ Reset</button><HoverBubble fullText="Reset this plan to the state you entered it in."/></div>
            <div><button onClick={this.props.onExport}>🔗 Create link</button><HoverBubble fullText="Create a shareable link that will always return the current setup of this plan."/></div>
        </div>;
    }
}