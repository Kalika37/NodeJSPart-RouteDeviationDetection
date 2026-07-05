const EARTH_RADIUS = 6371000; // meters

function toRadians(degrees) {
    return degrees * Math.PI / 180;
}

function haversineDistance(p1, p2) {

    const lat1 = toRadians(p1.lat);
    const lat2 = toRadians(p2.lat);

    const dLat = lat2 - lat1;
    const dLon = toRadians(p2.lon - p1.lon);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(
        Math.sqrt(a),
        Math.sqrt(1 - a)
    );

    return EARTH_RADIUS * c;
}
function calculateBearing(start, end) {

    const lat1 = toRadians(start.lat);
    const lat2 = toRadians(end.lat);

    const dLon = toRadians(end.lon - start.lon);

    const y = Math.sin(dLon) * Math.cos(lat2);

    const x =
        Math.cos(lat1) * Math.sin(lat2) -
        Math.sin(lat1) *
        Math.cos(lat2) *
        Math.cos(dLon);

    let bearing = Math.atan2(y, x);

    bearing = bearing * 180 / Math.PI;

    return (bearing + 360) % 360;
}
function createBoundingBox(start, end) {

    return {

        minLat: Math.min(start.lat, end.lat),

        maxLat: Math.max(start.lat, end.lat),

        minLon: Math.min(start.lon, end.lon),

        maxLon: Math.max(start.lon, end.lon)

    };

}

module.exports={haversineDistance,calculateBearing,createBoundingBox}