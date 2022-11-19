function points_to_wkt(points) {
    let pstrings = points.map(item => `${item.x.toFixed(10)} ${item.y.toFixed(10)}`)
    return `LINESTRING (${pstrings.join(',')})`
}

function parse_wkt(wkt) {
    return wkt.slice(wkt.indexOf("(") + 1, -1).split(",").map(item => item.split(" ")).map(([x, y]) => new Vector2(parseFloat(x), parseFloat(y)))
}