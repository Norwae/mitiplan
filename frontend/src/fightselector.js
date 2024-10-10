import React from "react";
import {fights} from "./fights";

import './fightselector.css'

export function FightSelector({selected, onFightSelected}) {

        const fightOptions = fights.map((f, i) => <option key={"f_" + i}
                                                                     value={"fight_" + i}>{f.name}</option>)
        const selectedIndex = fights.indexOf(selected)
        return <div><select className="fightSelectDropdown"
                       onChange={e => onFightSelected(fights[e.target.selectedIndex])}
                       value={"fight_" + selectedIndex}>
            {fightOptions}
        </select></div>
}

