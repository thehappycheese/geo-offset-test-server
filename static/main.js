"use strict";

const POINT_RADIUS = 6;

let points = [];
let points_offset_l = [];
let points_offset_r = [];

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

let status_div = document.querySelector("#status");
let update_status = () => {
    let world_mouse = transform_screen_to_world(mouse_screen);
    status_div.innerHTML = `offset:${get_offset()} x: ${world_mouse.x.toFixed(3).padStart(10, " ")} y:${world_mouse.y.toFixed(3).padStart(10, " ")}`;
}

let get_offset = () => parseFloat(document.querySelector("#offset_input").value);
let set_offset = new_offset => document.querySelector("#offset_input").value = new_offset;


canvas.addEventListener("pointerdown", pointer_down);
canvas.addEventListener("pointerleave", pointer_up);
canvas.addEventListener("pointermove", pointer_move);
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
canvas.addEventListener("wheel", pointer_scroll);
window.addEventListener("pointerup", pointer_up);


let mouse_screen = new Vector2(0, 0);


let drag = {
    active: false,
    point_index: null,
}


let pan = {
    active: false,
    start_mouse_screen: null,
    start_translate: null,
}


function update_mouse_position(e) {
    let rec = canvas.getBoundingClientRect()
    mouse_screen = new Vector2(
        e.clientX - rec.left,
        e.clientY - rec.top
    );
}


function pointer_move(e) {
    update_mouse_position(e);

    let mouse_world = transform_screen_to_world(mouse_screen);

    if (drag.active) {
        points[drag.point_index] = mouse_world;
        render()
        debounce_offset()
    } else if (pan.active) {
        let diff_screen = mouse_screen.sub(pan.start_mouse_screen);
        translate = pan.start_translate.add(diff_screen.div(scale));
        render()
    }
    update_status();
}


function pointer_scroll(e) {
    e.preventDefault();
    update_mouse_position(e);
    pan.active = false;
    drag.active = false;
    if (e.deltaY > 0) {
        let mouse_world_before = transform_screen_to_world(mouse_screen);
        scale = scale * 1.1;
        let mouse_world_after = transform_screen_to_world(mouse_screen);
        translate = translate.add(mouse_world_after.sub(mouse_world_before))
    } else {
        let mouse_world_before = transform_screen_to_world(mouse_screen);
        scale = scale / 1.1;
        let mouse_world_after = transform_screen_to_world(mouse_screen);
        translate = translate.add(mouse_world_after.sub(mouse_world_before))
    }
    update_status()
    render()
}


function pointer_down(e) {
    e.preventDefault();
    update_mouse_position(e);

    let mouse_world = transform_screen_to_world(mouse_screen);

    // TODO: lots of work to do ... maybe add some checks?
    let click_point = hit_test(points, mouse_world, POINT_RADIUS / scale);
    let click_line = hit_test_lines(points, mouse_world, POINT_RADIUS / scale);

    if (e.button == 1) {
        // middle mouse, pan
        console.log("middle mouse, pan");
        drag.active = false;
        pan.active = true;
        pan.start_mouse_screen = mouse_screen;
        pan.start_translate = translate;
    } else if (e.button == 2 && click_point > -1) {
        // right mouse, hit point, delete
        console.log("right mouse, hit point, delete");
        pan.active = false;
        drag.active = false;
        points.splice(click_point, 1);
    } else if (e.button == 0 && click_point > -1) {
        // left mouse, hit point, drag
        console.log("left mouse, hit point, drag");
        pan.active = false;
        drag.active = true;
        drag.point_index = click_point;
    } else if (e.button == 0 && click_line > -1) {
        // left mouse, hit line, add point between
        console.log("left mouse, hit line, add point between");
        points.splice(click_line + 1, 0, mouse_world);
        pan.active = false;
        drag.active = true;
        drag.point_index = click_line + 1;
    } else if (e.button == 0) {
        // left mouse, add point to end
        console.log("left mouse, add point to end");
        points.push(mouse_world);
        pan.active = false;
        drag.active = true;
        drag.point_index = points.length - 1;
    }
    render()
}


function pointer_up(e) {
    drag.active = false;
    pan.active = false;
    if (e.target == canvas) {
        update_mouse_position(e);
        debounce_offset();
    }
}


function draw_points(points) {
    let transformed_points = points.map(transform_world_to_screen)
    ctx.beginPath()
    transformed_points.forEach(item => ctx.lineTo(item.x, item.y))
    ctx.stroke()
    for (let i = 0; i < transformed_points.length - 1; i++) {
        let a = transformed_points[i];
        let b = transformed_points[i + 1];
        let ab = b.sub(a);
        let ab_len = ab.len()
        if (ab_len > 40) {
            let arrow_direction = ab.div(ab_len);
            let arrow_origin = b;
            let arrow_left_wing = arrow_direction.left().mul(POINT_RADIUS).add(arrow_direction.mul(-POINT_RADIUS)).add(arrow_origin);
            let arrow_right_wing = arrow_direction.right().mul(POINT_RADIUS).add(arrow_direction.mul(-POINT_RADIUS)).add(arrow_origin);
            ctx.beginPath();
            [arrow_left_wing, arrow_origin, arrow_right_wing].map(item => ctx.lineTo(item.x, item.y));
            ctx.stroke();
        }
    }
    transformed_points.forEach(
        item => {
            ctx.beginPath()
            ctx.arc(item.x, item.y, POINT_RADIUS / 2, 0, Math.PI * 2);
            ctx.fill()
        }
    )
}


function clear_points() {
    points = []
    points_offset_l = []
    points_offset_r = []
    render()
}


function render() {

    ctx.globalAlpha = 1
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    draw_grid()
    draw_origin()
    ctx.setLineDash([])
    ctx.lineWidth = 2
    ctx.font = "bold 20px sans-serif"
    ctx.textBaseline = "top";
    ctx.strokeStyle = "black"
    ctx.fillStyle = "black"
    ctx.fillText("input", 5, 5 + 20 + 2)
    draw_points(points);

    ctx.globalAlpha = 0.5

    ctx.strokeStyle = "rebeccapurple"
    ctx.fillStyle = "rebeccapurple"
    ctx.fillText("input.offset(-distance)", 5, 5)
    draw_points(points_offset_l);

    ctx.strokeStyle = "orangered"
    ctx.fillStyle = "orangered"
    ctx.fillText("input.offset(+distance)", 5, 5 + 20 * 2 + 2 * 2)
    draw_points(points_offset_r);

}

function draw_origin() {
    let origin_world = new Vector2(0, 0);
    let unit_x = new Vector2(1, 0);
    let unit_y = new Vector2(0, 1);

    let origin_screen = transform_world_to_screen(origin_world);
    if (!(origin_screen.x > 10
        && origin_screen.x < canvas.width - 10
        && origin_screen.y > 10
        && origin_screen.y < canvas.height - 10)) {

        origin_screen = new Vector2(10, canvas.height - 50)
    }

    let size = 40;
    let arrow_length = 6;
    let arrow_width = 5;

    function draw_chunk(origin, direction, normal, text, color) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        [
            origin,
            origin.add(direction.mul(size)),
            origin.add(direction.mul(size)),
            origin.add(direction.mul(size - arrow_length).add(normal.mul(arrow_width)))
        ]
            //.map(item=>transform_world_to_screen(item))
            .map(item => ctx.lineTo(item.x, item.y));
        ctx.stroke();

        let label_position = origin.add(direction.mul(size-arrow_length/2).add(normal.mul(arrow_width*2.5)))
        ctx.fillStyle = color
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        ctx.fillText(text, label_position.x, label_position.y)
    }
    ctx.save()
        ctx.lineWidth = 3;
        draw_chunk(origin_screen,unit_x,unit_y,"x","red");
        draw_chunk(origin_screen,unit_y,unit_x,"y","green");
    ctx.restore();
}


let possible_spacings = [0.001, 0.01, 0.05, 0.1, 0.5, 1, 5, 10, 25, 50, 100, 200, 500, 1000].reverse();
function draw_grid() {
    let top_left = transform_screen_to_world(new Vector2(0, 0))
    let bottom_right = transform_screen_to_world(new Vector2(canvas.width, canvas.height))
    let world_size = bottom_right.sub(top_left);
    let spacing;
    for (spacing of possible_spacings) {
        let count = world_size.x / spacing
        if (count >= 10) {
            break
        }
    }

    ctx.save()
    ctx.lineWidth = 1
    ctx.strokeStyle = "grey"
    ctx.setLineDash([3, 3])

    let start_x = (top_left.x - top_left.x % spacing)
    let count_x = world_size.x / spacing
    for (let i = 0; i < count_x + 1; i++) {

        ctx.beginPath();
        [
            new Vector2(start_x + i * spacing, top_left.y),
            new Vector2(start_x + i * spacing, bottom_right.y)
        ]
            .map(item => transform_world_to_screen(item))
            .map(item => ctx.lineTo(item.x, item.y));
        ctx.stroke()
    }
    let start_y = (top_left.y - top_left.y % spacing)
    let count_y = world_size.y / spacing
    for (let i = 0; i < count_y + 1; i++) {
        ctx.beginPath();
        [
            new Vector2(top_left.x, start_y + i * spacing),
            new Vector2(bottom_right.x, start_y + i * spacing)
        ]
            .map(item => transform_world_to_screen(item))
            .map(item => ctx.lineTo(item.x, item.y));
        ctx.stroke();
    }
    ctx.restore()
}


let last_offset_call = performance.now();
let timer_handel = undefined;
function debounce_offset() {
    clearTimeout(timer_handel);
    let now = performance.now()
    let time_since_offset = now - last_offset_call;
    if (time_since_offset > 300) {
        offset()
    } else {
        timer_handel = setTimeout(offset, 100)
    }
}


async function rpc_offset(points, offset) {
    if (points.length < 2) {
        return [];
    }
    let ls_wkt = points_to_wkt(points);
    let response = await fetch("../?" + new URLSearchParams({
        wkt: ls_wkt,
        offset: offset,
    }))
    let offset_ls_wkt = await response.text()
    return parse_wkt(offset_ls_wkt)
}


async function offset() {
    last_offset_call = performance.now();
    let offset = get_offset()
    points_offset_l = await rpc_offset(points, -offset);
    points_offset_r = await rpc_offset(points, offset);
    render()
}

restore_example(examples[0])