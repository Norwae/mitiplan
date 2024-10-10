import React, {useEffect, useMemo, useState} from "react";
import {jobs} from "./jobs";

import './jobbar.css'

function JobToggle({active, friendlyName, code, toggle}) {
    return <li onClick={toggle} className={active ? "active" : "inactive"}>
        <img src={"/" + code + ".png"} alt={friendlyName}/>
        <span>{friendlyName}</span>
    </li>;

}

export function JobBar({party, onPartySelected}) {
    const [selected, setSelected] = useState({})
    const [count, setCount] = useState(0)
    if (party) {
        const {select, updated} = party.reduce((acc, next) => {
            acc.select[next.code] = true
            acc.updated |= !selected[next.code]
            return acc;
        }, {select: {}, updated: false});

        if (updated) {
            setCount(8)
            setSelected(select)
        }
    }
    const toggleJob = (code) => {
        const newState = !selected[code];
        const newCount = count + (newState ? 1 : -1);

        if (count === 8) {
            if (newState) {
                return
            } else {
                onPartySelected(null)
            }
        }

        const newSelected = {
            ...selected,
            [code]: newState
        }

        setSelected(newSelected)
        setCount(newCount)

        if (newCount === 8) {
            onPartySelected(jobs.filter(({code}) => newSelected[code]))
        }
    }

    return <ul className="toggle_container">
        {jobs.map(({code, friendlyName}) =>
            <JobToggle friendlyName={friendlyName} code={code} active={selected[code]} key={code}
                       toggle={() => toggleJob(code)}/>)}
    </ul>
}
