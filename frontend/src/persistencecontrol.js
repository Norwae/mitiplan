import React from "react";

import HoverBubble from "./hoverbubble";
import './persistencecontrol.css'
import {toast} from "react-hot-toast";
import {PersistenceModel} from "./persistence";

export class PersistenceControl extends React.Component {
    intervalHandle: number
    constructor(props) {
        super(props);
        this.state = {
            firstHash: window.location.hash,
        }

        setTimeout(() => this.resetToBase(), 10)
        this.intervalHandle = setInterval(() => this.createLink(), 5000)
    }


    componentWillUnmount() {
        clearInterval(this.intervalHandle)
        super.componentWillUnmount();
    }

    async resetToBase() {
        const hash = this.state.firstHash;
        window.location.hash = hash
        if (hash && hash !== "#") {
            try {
                const model = await PersistenceModel.load(hash.substring(1))
                await this.props.unmarshall(model)
            } catch (e) {
                toast("Sorry, we couldn't load your plan.")
                console.log("Loading / unmarshalling plan failed", e)
                window.location.hash = ""
            }
        }
    }

    async createLink() {
        const model: PersistenceModel | "UNCHANGED" | null = this.props.marshall()

        if (model && model !== "UNCHANGED") {
            window.location.hash = await model.store()
        }
    }

    async createLinkAndUpdateBase() {
        const model: PersistenceModel | "UNCHANGED" | null = this.props.marshall()
        if (!model) {
            toast("Cannot save this fight, make sure you have a full fight definition (party + fight selected)")
            return
        }
        let key: string;

        if (model === "UNCHANGED"){
           key = window.location.hash
        } else {
            key = (await model.store()) || window.location.hash
        }
        this.setState({
            firstHash: key
        })
        window.location.hash = key
        await this.copyLink()
    }

    async copyLink() {
        await navigator.clipboard.writeText(window.location)
        toast('Shareable link copied', {icon: '🔗'})
    }

    render() {
        return <div className="persistenceControl">
            <div>
                <button onClick={() => this.resetToBase()}>↺ Reset</button>
                <HoverBubble fullText="Reset this plan to the state you entered it in."/></div>
            <div>
                <button onClick={() => this.createLinkAndUpdateBase()}>🔗 Create link</button>
                <HoverBubble
                    fullText="Create a shareable link that will always return the current setup of this plan."/></div>
            <div>Current share URL:</div>
            <div><input type="text" readOnly="readonly" value={window.location.href} onClick={() => this.copyLink()}/>
            </div>
        </div>;
    }
}