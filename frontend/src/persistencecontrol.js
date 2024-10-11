import React, {useEffect, useState} from "react";

import HoverBubble from "./hoverbubble";
import './persistencecontrol.css'
import {toast} from "react-hot-toast";
import {PersistenceModel} from "./persistence";
import {fights} from "./fights";

export function PersistenceControl({marshall, unmarshall}) {
    const [firstHash, setFirstHash] = useState(window.location.hash)
    useEffect(() => {
        const handler = setInterval(() => createLink(), 500)
        return () => {
            clearInterval(handler)
        }
    })

    async function resetToBase() {
        const hash = firstHash;
        window.location.hash = hash
        if (hash && hash !== "#") {
            try {
                const model = await PersistenceModel.load(hash.substring(1))
                await unmarshall(model)
            } catch (e) {
                toast("Sorry, we couldn't load your plan.")
                console.log("Loading / unmarshalling plan failed", e)
                window.location.hash = ""
            }
        } else {
            unmarshall(new PersistenceModel(null, [], fights[0]))
        }
    }

    async function createLink() {
        const model: PersistenceModel | "UNCHANGED" | null = marshall()

        if (model && model !== "UNCHANGED") {
            window.location.hash = await model.store()
        }
    }

    async function createLinkAndUpdateBase() {
        const model: PersistenceModel | null = marshall(true)
        if (!model) {
            toast("Cannot save this fight, make sure you have a full fight definition (party + fight selected)")
            return
        }
        window.location.hash = (await model.store()) || window.location.hash
        setFirstHash(window.location.hash)
        await copyLink()
    }

    async function copyLink() {
        await navigator.clipboard.writeText(window.location)
        toast('Shareable link copied', {icon: '🔗'})
    }

    return <div className="persistenceControl">
        <div>
            <button id="resetButton" onClick={() => resetToBase()}>↺ Reset</button>
            <HoverBubble fullText="Reset this plan to the state you entered it in."/></div>
        <div>
            <button id="exportButton" onClick={() => createLinkAndUpdateBase()}>🔗 Create link</button>
            <HoverBubble
                fullText="Create a shareable link that will always return the current setup of this plan."/></div>
        <div>Current share URL:</div>
        <div><input type="text" readOnly="readonly" value={window.location.href} onClick={() => copyLink()}/>
        </div>
    </div>;
}

PersistenceControl.initialLoad = () => {
    document.getElementById("resetButton").click()
}