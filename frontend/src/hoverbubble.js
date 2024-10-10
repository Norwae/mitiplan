import {useState} from "react";

import './hoverbubble.css'

export default function HoverBubble({fullText, prompt}) {
    const [active, setActive] = useState(false)
    const [anchor, setAnchor] = useState({x: 0, y: 0})

    const style = {
        top: (anchor.y - 30) + "px",
        left: (anchor.x - 230)+"px"
    };

    console.log("Rendering with offset style", style)
    return <span className="hoverbubble-container">
        <span className="hoverbubble-trigger" onMouseEnter={(evt: MouseEvent) => {
            setActive(true)
            setAnchor({
                x: evt.pageX,
                y: evt.pageY
            })
        }} onMouseLeave={() => setActive(false)}>
            {prompt || "?"}
        </span>
        {
            active ? <div className="hoverbubble-full" style={style}>{fullText}</div> : ""
        }
    </span>;
}