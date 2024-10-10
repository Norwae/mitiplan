import {useState} from "react";

import './hoverbubble.css'

export default class HoverBubble extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            active: false, anchor: {
                x: 0, y: 0
            }
        }
    }

    render() {
        const style = {
            top: (this.state.anchor.y - 30) + "px", left: (this.state.anchor.x - 230) + "px", display: this.state.active ? "block" : "none"
        };

        return <span className="hoverbubble-container">
            <span className="hoverbubble-trigger" onMouseEnter={(evt: MouseEvent) => {
                this.setState({
                        active: true,
                        anchor: {
                            x: evt.pageX,
                            y: evt.pageY
                        }
                    }
                )
            }} onMouseLeave={() => setActive(false)}>
                {prompt || "?"}
            </span>
            <div className="hoverbubble-full" style={style}>{fullText}</div>
        </span>;
    }

}