const EARTH_RADIUS = 6371000;

//--------------------------------------------------
// Degree → Radian
//--------------------------------------------------

function toRadians(degree) {
    return degree * Math.PI / 180;
}

//--------------------------------------------------
// Haversine Distance
//--------------------------------------------------

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

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return EARTH_RADIUS * c;
}

//--------------------------------------------------
// Bearing
//--------------------------------------------------

function calculateBearing(start, end) {

    const lat1 = toRadians(start.lat);
    const lat2 = toRadians(end.lat);

    const dLon = toRadians(end.lon - start.lon);

    const y =
        Math.sin(dLon) *
        Math.cos(lat2);

    const x =
        Math.cos(lat1) *
        Math.sin(lat2) -
        Math.sin(lat1) *
        Math.cos(lat2) *
        Math.cos(dLon);

    let bearing =
        Math.atan2(y, x);

    bearing =
        bearing *
        180 /
        Math.PI;

    return (bearing + 360) % 360;

}

//--------------------------------------------------
// Bounding Box
//--------------------------------------------------

function createBoundingBox(start, end) {

    return {

        minLat: Math.min(start.lat, end.lat),

        maxLat: Math.max(start.lat, end.lat),

        minLon: Math.min(start.lon, end.lon),

        maxLon: Math.max(start.lon, end.lon)

    };

}

//--------------------------------------------------
// Curvature
//--------------------------------------------------

function calculateCurvature(previousBearing, currentBearing) {

    if (previousBearing === null)
        return 0;

    let diff =
        Math.abs(currentBearing - previousBearing);

    if (diff > 180)
        diff = 360 - diff;

    return diff;

}

//--------------------------------------------------
// Adaptive Corridor Width
//--------------------------------------------------

function calculateCorridor(curvature) {

    if (curvature < 10)
        return 35;

    if (curvature < 30)
        return 30;

    if (curvature < 60)
        return 25;

    return 20;

}

//--------------------------------------------------
// Walking Speed Profile
//--------------------------------------------------

function estimateSpeed(curvature) {

    if (curvature > 45)
        return 1.0;

    return 1.4;

}

//--------------------------------------------------
// Route Segmentation
//--------------------------------------------------

function buildRouteSegments(points) {

    const segments = [];

    let cumulativeDistance = 0;

    let previousBearing = null;

    for (let i = 0; i < points.length - 1; i++) {

        const start = points[i];

        const end = points[i + 1];

        const length =
            haversineDistance(start, end);

        const bearing =
            calculateBearing(start, end);

        const curvature =
            calculateCurvature(
                previousBearing,
                bearing
            );

        const corridorWidth =
            calculateCorridor(curvature);

        const speedProfile =
            estimateSpeed(curvature);

        const boundingBox =
            createBoundingBox(start, end);

        segments.push({

            id: i,

            start,

            end,

            length,

            bearing,

            cumulativeDistance,

            corridorWidth,

            speedProfile,

            curvature,

            boundingBox,

            previousSegment:
                i === 0
                    ? null
                    : i - 1,

            nextSegment:
                i === points.length - 2
                    ? null
                    : i + 1

        });

        cumulativeDistance += length;

        previousBearing = bearing;

    }

    return segments;

}

module.exports=buildRouteSegments