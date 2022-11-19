
const POINT_RADIUS = 6;

let points = [];
let points_offset_l = [];
let points_offset_r = [];

let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

let status_div = document.querySelector("#status");
let update_status = () => status_div.innerHTML = `offset:${get_offset()} x: ${mouse_screen.x.toFixed(3)} y:${mouse_screen.y.toFixed(3)}`;

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
    )
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
    ctx.lineWidth = 2
    ctx.strokeStyle = "black"
    ctx.fillStyle = "black"
    draw_points(points);
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = "rebeccapurple"
    ctx.fillStyle = "rebeccapurple"
    draw_points(points_offset_l);
    ctx.strokeStyle = "orangered"
    ctx.fillStyle = "orangered"
    draw_points(points_offset_r);
}

let last_offset_call = performance.now();
let timer_handel = undefined;
function debounce_offset() {
    clearTimeout(timer_handel);
    let now = performance.now()
    let time_since_offset = now-last_offset_call;
    if (time_since_offset>300) {
        offset()
    }else{
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
    points_offset_r = await rpc_offset(points,  offset);
    render()
}

