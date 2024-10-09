import React from "react";
import {fights} from "./fights";

import './fightselector.css'

export class FightSelector extends React.Component {

    render() {
        const fightOptions = fights.map((f, i) => <option key={"f_" + i}
                                                                     value={"fight_" + i}>{f.name}</option>)
        const selectedIndex = fights.indexOf(this.props.selected)
        return <div><select className="fightSelectDropdown"
                       onChange={e => this.props.onFightSelected(fights[e.target.selectedIndex])}
                       value={"fight_" + selectedIndex}>
            {fightOptions}
        </select></div>
    }
}

