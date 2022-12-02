import React from "react";
import { FC } from "react";




export const ShapeList:FC<{
    items:string[]
}> = (props) => {
    return <div>
        {props.items.map(item=><p key={item}>{item}</p>)}
    </div>
}