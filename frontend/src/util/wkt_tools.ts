import Vector2 from './Vector2'

export function points_to_wkt(points:Vector2[]) {
    let point_strings = points.map(item => `${item.x.toFixed(10)} ${item.y.toFixed(10)}`)
    return `LINESTRING (${point_strings.join(',')})`
}

export function parse_wkt(wkt:string) {
    return wkt
        .slice(wkt.indexOf("(") + 1, -1)
        .split(",")
        .map(item => item.split(" "))
        .map(([x, y]) => new Vector2(parseFloat(x), parseFloat(y)));
}