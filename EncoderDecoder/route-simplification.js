/**
 * Simplify a route using
 * Douglas-Peucker Algorithm.
 *
 * @param {Array} points
 * @param {Number} tolerance
 *
 * @returns simplified array
 */
const perpendicularDistance = require('./perpendicular-distance.js')
function douglasPeucker(points, tolerance) {

    // If only two points exist,
    // nothing can be simplified.

    if (points.length <= 2) {
        return points;
    }
    let maxDistance = 0;
    let farthestIndex = 0;

    const first = points[0];
    const last = points[points.length - 1];

    // --------------------------------------------------
    // Find the point farthest from the line
    // --------------------------------------------------

    for (let i = 1; i < points.length - 1; i++) {

        const distance = perpendicularDistance(
            points[i],
            first,
            last
        );

        if (distance > maxDistance) {
            maxDistance = distance;
            farthestIndex = i;
        }
    }

    // --------------------------------------------------
    // If every point lies close enough
    // remove them.
    // --------------------------------------------------

    if (maxDistance < tolerance) {

        return [
            first,
            last
        ];
    }

    // --------------------------------------------------
    // Otherwise split into two halves
    // --------------------------------------------------

    const left = douglasPeucker(
        points.slice(0, farthestIndex + 1),
        tolerance
    );

    const right = douglasPeucker(
        points.slice(farthestIndex),
        tolerance
    );

    // Merge both results
    // Remove duplicate middle point

    return [
        ...left.slice(0, -1),
        ...right
    ];
}

module.exports=douglasPeucker