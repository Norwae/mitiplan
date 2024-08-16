import React from "react";
import type {Ability} from "./jobs";
import {fights} from "./fights";

export class FightSelector extends React.Component {

    render() {
        const fightOptions = fights.map((f, i) => <option key={"f_" + i}
                                                                     value={"fight_" + i}>{f.name}</option>)
        const selectedIndex = fights.indexOf(this.props.selected)
        return <select className="fightSelectDropdown"
                       onChange={e => this.props.onFightSelected(this.props.fights[e.target.selectedIndex])}
                       value={"fight_" + selectedIndex}>
            {fightOptions}
        </select>
    }
}

