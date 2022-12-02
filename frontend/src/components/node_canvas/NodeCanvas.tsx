// eslint-disable no-unused-vars

import React, { useCallback, useEffect, useRef, useState } from "react";
import Vector2 from "../../util/Vector2";
import { Transform } from "./Transform";
import {hit_test, hit_test_lines} from './hit_test';



type HoverState = {
    type:"point"|"line",
    index:number
}|{
    type:"none"
};

type DragState = {
    type:"point"|"line"|"world"
    start_mouse_screen:Vector2
    start_position:Vector2
    index:number
}|{
    type:"none"
};

const mouse_position_from_event = (e:React.PointerEvent<Element>, canvas:HTMLCanvasElement) =>{
    let rec = canvas.getBoundingClientRect();
    return new Vector2(
        e.clientX - rec.left,
        e.clientY - rec.top
    );
}

interface NodeCanvasProps {
    points:Vector2[]
    set_points:React.Dispatch<React.SetStateAction<Vector2[]>>
    point_render_diameter?:number
    line_thickness?:number
}
export const NodeCanvas = React.memo(({
    points,
    set_points,
    point_render_diameter=8,
    line_thickness=2.5
}:NodeCanvasProps)=>{
    //console.log("NodeCanvas - Processing");
    const ref_canvas = useRef<HTMLCanvasElement | null>(null);
    const [transform, set_transform] = useState(new Transform());
    const [canvas_size, set_canvas_size] = useState(new Vector2());
    const [hover_state, set_hover_state] = useState({type:"none"} as HoverState);
    const [drag_state, set_drag_state] = useState({type:"none"} as DragState)
    //const [mouse_screen, set_mouse_screen] = useState(new Vector2());

    /**
     * This is a special callback to update the canvas size.
     * We don't ever want the actual canvas element to be rendered.
     * Therefore we will manually mange the canvas width and height
     */
    const update_canvas_size = useCallback(()=>{
        if(!ref_canvas.current) return;
        let parent = ref_canvas.current.parentElement;
        if(!parent) return;
        set_canvas_size(new Vector2(parent.clientWidth, parent.clientHeight))
        ref_canvas.current.width=parent.clientWidth;
        ref_canvas.current.height=parent.clientHeight;
    },[])

    /**
     * Initialization
     * Should only run once
     */
    useEffect(() => {
        console.log("NodeCanvas - Init")
        update_canvas_size()
    },[update_canvas_size]);

    useEffect(()=>{
        console.log("NodeCanvas - Updated window resize listener");
        const callback_caller = (e) => update_canvas_size();
        window.addEventListener("resize", callback_caller);
        return ()=> window.removeEventListener("resize", callback_caller)
    }, [update_canvas_size]);

    // render
    useEffect(()=>{
        console.log("Node-Canvas - Rendered")
        if(!ref_canvas.current) return;
        const ctx = ref_canvas.current.getContext('2d');
        if(!ctx) return;
        ctx.clearRect(0,0,ref_canvas.current.width, ref_canvas.current.height);
        // TODO: add transform
        ctx.strokeStyle = "black";
        ctx.lineWidth = line_thickness;
        ctx.beginPath()
        points.forEach(point=>ctx.lineTo(point.x, point.y));
        ctx.stroke()
        for(let point of points){
            ctx.beginPath()
            ctx.arc(point.x,point.y,5,0,Math.PI*2);
            ctx.fill()
        }
        if(hover_state.type==="point"){
            ctx.strokeStyle = "red";
            ctx.beginPath()
            ctx.arc(points[hover_state.index].x,points[hover_state.index].y,5,0,Math.PI*2);
            ctx.fill()
            ctx.stroke();
        }
        if(hover_state.type==="line"){
            ctx.strokeStyle = "red";
            ctx.beginPath()
            ctx.lineTo(points[hover_state.index].x, points[hover_state.index].y);
            ctx.lineTo(points[hover_state.index+1].x, points[hover_state.index+1].y);
            ctx.stroke()
        }
    },[
        points,
        canvas_size,
        transform,
        hover_state,
        point_render_diameter,
        line_thickness
    ])

    const pointer_down = useCallback((e:React.PointerEvent<HTMLCanvasElement>)=>{
        e.preventDefault();
        // ref_canvas.current && set_mouse_screen(
        //     mouse_position_from_event(e, ref_canvas.current)
        // );
        let mouse_screen = mouse_position_from_event(e, ref_canvas.current);
        let mouse_world = transform.screen_to_world(mouse_screen);
        if(hover_state.type==="point"){
            set_drag_state({
                type:"point",
                start_mouse_screen:mouse_screen,
                start_position:points[hover_state.index],
                index:hover_state.index
            })
        }
        console.log("Pointer Down")
    },[set_drag_state, hover_state, points, transform]);

    const pointer_up = useCallback((e:React.PointerEvent<any>)=>{
        console.log("Pointer Up")
        set_drag_state({type:"none"})
    },[set_drag_state]);

    const pointer_move = useCallback((e:React.PointerEvent<any>)=>{
        console.log("Pointer Move")
        // ref_canvas.current && set_mouse_screen(
        //     mouse_position_from_event(e, ref_canvas.current)
        // );
        let mouse_screen = mouse_position_from_event(e, ref_canvas.current);
        let mouse_world = transform.screen_to_world(mouse_screen);
        if(drag_state.type==="none"){
            let hover_point;
            let hover_line;
            if((hover_point = hit_test(points, mouse_world, point_render_diameter / transform.scale))>-1){
                set_hover_state({type:"point", index:hover_point})
            }else if((hover_line = hit_test_lines(points, mouse_world, point_render_diameter / transform.scale))>-1){
                set_hover_state({type:"line", index:hover_line});
            }else if(hover_state.type!=="none"){
                set_hover_state({type:"none"});
            }
        }else if (drag_state.type==="point") {
            let drag_distance = mouse_screen.sub(drag_state.start_mouse_screen);
            points[drag_state.index] = drag_state.start_position.add(drag_distance);
            set_points([...points])
        }
    },[hover_state, drag_state, set_hover_state, transform, set_points, points, point_render_diameter]);

    const pointer_leave = useCallback((e:React.PointerEvent<any>)=>{
        set_drag_state({type:"none"});
    },[set_drag_state]);

    const wheel = useCallback((e:React.WheelEvent<any>)=>{
        e.preventDefault();
        console.log("Wheel")
    },[]);

    return <canvas
        className="node_canvas"
        ref={ref_canvas}
        onPointerDown={pointer_down}
        onPointerUp={pointer_up}
        onPointerMove={pointer_move}
        onPointerLeave={pointer_leave}
        onWheel={wheel}
        onContextMenu={e => e.preventDefault()}
    ></canvas>;
});



// function pointer_down(event:PointerEvent, canvas:HTMLCanvasElement) {
//     event.preventDefault();
//     update_mouse_position(event);

//     let mouse_world = transform_screen_to_world(mouse_screen);

//     // TODO: lots of work to do ... maybe add some checks?
//     let click_point = hit_test(points, mouse_world, POINT_RADIUS / scale);
//     let click_line = hit_test_lines(points, mouse_world, POINT_RADIUS / scale);

//     if (event.button == 1) {
//         // middle mouse, pan
//         console.log("middle mouse, pan");
//         drag.active = false;
//         pan.active = true;
//         pan.start_mouse_screen = mouse_screen;
//         pan.start_translate = translate;
//     } else if (event.button == 2 && click_point > -1) {
//         // right mouse, hit point, delete
//         console.log("right mouse, hit point, delete");
//         pan.active = false;
//         drag.active = false;
//         points.splice(click_point, 1);
//     } else if (event.button == 0 && click_point > -1) {
//         // left mouse, hit point, drag
//         console.log("left mouse, hit point, drag");
//         pan.active = false;
//         drag.active = true;
//         drag.point_index = click_point;
//     } else if (event.button == 0 && click_line > -1) {
//         // left mouse, hit line, add point between
//         console.log("left mouse, hit line, add point between");
//         points.splice(click_line + 1, 0, mouse_world);
//         pan.active = false;
//         drag.active = true;
//         drag.point_index = click_line + 1;
//     } else if (event.button == 0) {
//         // left mouse, add point to end
//         console.log("left mouse, add point to end");
//         points.push(mouse_world);
//         pan.active = false;
//         drag.active = true;
//         drag.point_index = points.length - 1;
//     }
//     render()
// }
