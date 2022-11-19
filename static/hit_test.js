function hit_test(points, test_point, threshold) {
    return points.findIndex(
        point => point.sub(test_point).len() < threshold
    )
}

function hit_test_lines(points, test_point, threshold) {
    for (let i = 0; i < points.length - 1; i++) {
        let a = points[i];
        let b = points[i + 1];
        let ab = b.sub(a);
        let am = test_point.sub(a);
        let ab_len = ab.len()
        let ab_unit = ab.div(ab_len);
        let distance_along_ab = ab_unit.dot(am);
        if (distance_along_ab > 0 && distance_along_ab < ab_len) {
            let nearest_point = a.add(
                ab_unit.mul(distance_along_ab)
            )
            let dist = test_point.distance_to(nearest_point)
            if (dist < threshold) {
                return i
            }
        }
    }
    return -1
}