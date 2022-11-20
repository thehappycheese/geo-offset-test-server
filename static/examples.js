

function capture_example() {
    result = {
        points: points.map(item => [item.x, item.y]),
        scale: scale,
        translate: [translate.x, translate.y],
        offset: get_offset(),
    }
    console.log(JSON.stringify(result));
    return result
}

function restore_example(example) {
    points = example.points.map(item => new Vector2(...item));
    translate = new Vector2(...example.translate);
    scale = example.scale;
    set_offset(example.offset);
    offset()
    render();
}

function translate_all_by_mouse() {
    let offset_point = transform_screen_to_world(mouse_screen);
    points = points.map(item => item.sub(offset_point))
    offset()
}
let examples = [
    { "points": [[42.68595877102524, 96.86478343167613], [69.32348353026305, 49.0538415561212], [84.34977954829458, 3.9749535020265228], [81.6177257268343, -41.786948007433196], [70.00649698562808, -65.69241894521068], [48.83307986931089, -77.30364768641687], [15.365420556422464, -68.42447276667095], [-3.758956193799577, -45.88502873962362], [-31.079494408402354, -56.130230570099684], [-29.71346749767224, -90.96391679371828], [-9.906077292085172, -109.40528008857518], [24.927608931533427, -116.91842809759095], [66.5914297088027, -135.35979139244785], [70.00649698562808, -164.0463565177808], [60.444308610517055, -181.80470635727264], [44.05198568175541, -187.95182745555826]], "scale": 1.0999999999999999, "translate": [316.52261782342964, 241.96086517037105], "offset": 18 },
    { "points": [[-84, 45.19999694824219], [-79, -154.8000030517578], [-49, -70.80000305175781], [101, -70.80000305175781]], "scale": 1, "translate": [374, 330], "offset": 30 },
    { "points": [[19.301345536507043, 74.59186894961118], [57.30134553650704, 74.59186894961118], [103.30134553650704, 17.591868949611182], [55.30134553650704, 21.591868949611182]], "scale": 1.9487171000000008, "translate": [120.40518147318875, 56.41585907094697], "offset": 30 },
    { "points": [[-32.07843252363301, -43.203538400668606], [77.42950990679975, -43.7680123307224], [47.25770097670926, -29.103205417497293]], "scale": 1.771561000000001, "translate": [144.02487523714956, 150.39078361611476], "offset": 30 },
    { "points": [[-32.07843252363301, -43.203538400668606], [77.42950990679975, -43.7680123307224], [50.71863063140353, -25.92428203925691]], "scale": 1.771561000000001, "translate": [144.02487523714956, 150.39078361611476], "offset": 30 },
    { "points": [[-32.07843252363301, -43.203538400668606], [77.42950990679975, -43.7680123307224], [-32.82351101655547, 30.52311096612081]], "scale": 1.771561000000001, "translate": [144.02487523714956, 150.39078361611476], "offset": 30 },
    {"points":[[-32.07843252363301,-43.203538400668606],[77.42950990679975,-43.7680123307224],[82.32917071441506,-36.084812780224894]],"scale":1.771561000000001,"translate":[144.02487523714956,150.39078361611476],"offset":35},
]