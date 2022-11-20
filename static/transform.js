let translate = new Vector2(0, 0);
let scale = 1;
function reset_view(){
    translate = new Vector2(0, 0);
    scale = 1;
    let offset = transform_screen_to_world(
        new Vector2(canvas.width/2, canvas.height/2)
    );
    translate = translate.add(offset)
    render()
}

function transform_world_to_screen(point) {
    return point.add(translate).mul(scale);
}

function transform_screen_to_world(point) {
    return point.div(scale).sub(translate);
}
