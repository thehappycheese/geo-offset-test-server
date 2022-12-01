import React, { useCallback, useEffect, useRef, useState } from "react";
import Vector2 from "../../util/Vector2";


class Transform{
    // consider to be immutable
    #translate:Vector2
    #scale:number
    constructor(translation?:Vector2, scale?:number){
        this.#translate = translation ?? new Vector2();
        this.#scale = scale ?? 1;
    }
    clone(){
        return new Transform(this.#translate.clone(), this.#scale);
    }
    clone_with_translate(new_translation:Vector2){
        return new Transform(new_translation, this.#scale);
    }
    clone_with_scale(new_scale:number){
        return new Transform(this.#translate.clone(), new_scale);
    }
    world_to_screen(point:Vector2) {
        return point.add(this.#translate).mul(this.#scale);
    }
    screen_to_world(point) {
        return point.div(this.#scale).sub(this.#translate);
    }
    toString(){
        return `(p+${this.#translate.toString()})*${this.#scale}`
    }
}

export const NodeCanvas = React.memo((props:{points:Vector2[]})=>{
    console.log("NodeCanvas - Processing");
    const ref_canvas = useRef<HTMLCanvasElement | null>(null);
    const [transform, set_transform] = useState(new Transform())
    const [canvas_size, set_canvas_size] = useState(new Vector2())

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
        if(!ref_canvas.current) return;
        const ctx = ref_canvas.current.getContext('2d');
        if(!ctx) return;

        ctx.beginPath()
        ctx.lineTo(10,10)
        ctx.lineTo(20,20)
        ctx.stroke()
        console.log("Node-Canvas - Rendered")
    },[canvas_size, transform])

    const pointer_down = useCallback((e:React.PointerEvent<HTMLCanvasElement>)=>{
        console.log("Pointer Down")
    },[]);

    const pointer_up = useCallback((e:React.PointerEvent<any>)=>{
        console.log("Pointer Up")
    },[]);

    const pointer_move = useCallback((e:React.PointerEvent<any>)=>{
        console.log("Pointer Move")
    },[]);

    
    

    return <canvas
        className="node_canvas"
        ref={ref_canvas}
        onPointerDown={pointer_down}
        onPointerUp={pointer_up}
        onPointerMove={pointer_move}
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
