/**
 * Calculate perpendicular distance from a point
 * to a line segment.
 */
function perpendicularDistance(point, start, end) {

    // If both endpoints are identical
    if (
        start.lat === end.lat &&
        start.lon === end.lon
    ) {
        return Math.sqrt(
            (point.lat - start.lat) ** 2 +
            (point.lon - start.lon) ** 2
        );
    }

    // Vector AB
    const dx = end.lon - start.lon;
    const dy = end.lat - start.lat;

    // Projection factor
    const t =
        (
            (point.lon - start.lon) * dx +
            (point.lat - start.lat) * dy
        ) /
        (dx * dx + dy * dy);

    // Clamp projection to the segment
    const clamped = Math.max(0, Math.min(1, t));

    // Closest point on segment
    const nearestLon = start.lon + clamped * dx;
    const nearestLat = start.lat + clamped * dy;

    // Euclidean distance
    return Math.sqrt(
        (point.lon - nearestLon) ** 2 +
        (point.lat - nearestLat) ** 2
    );
}

module.exports=perpendicularDistance