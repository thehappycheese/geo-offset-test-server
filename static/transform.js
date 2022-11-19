let translate = new Vector2(0, 0);
let scale = 1;
function reset_view(){
    translate = new Vector2(0, 0);
    scale = 1;
    render()
}

function transform_world_to_screen(point) {
    return point.add(translate).mul(scale);
}

function transform_screen_to_world(point) {
    return point.div(scale).sub(translate);
}
