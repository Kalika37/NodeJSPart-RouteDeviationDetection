/**
 * ----------------------------------------------------
 * DeltaEncoder.js
 * ----------------------------------------------------
 * Converts absolute GPS coordinates into
 * delta-encoded coordinates.
 *
 * Precision:
 *      1e7
 *
 * Output:
 *      First point  -> Absolute
 *      Remaining    -> Delta
 * ----------------------------------------------------
 */

class DeltaEncoder {

    static SCALE = 10000000;

    /**
     * Convert floating-point coordinate
     * to fixed-point integer.
     */
    static encodeCoordinate(value) {

        return Math.round(
            value * this.SCALE
        );

    }

    /**
     * Delta encode route segments.
     *
     * @param {Array} segments
     *
     * @returns {Object}
     */
    static encode(segments) {

        if (!Array.isArray(segments)) {

            throw new Error(
                "Segments must be an array."
            );

        }

        if (segments.length === 0) {

            throw new Error(
                "No segments found."
            );

        }

        const encodedSegments = [];

        //------------------------------------------------
        // First point stored absolutely
        //------------------------------------------------

        let previousLat =
            this.encodeCoordinate(
                segments[0].start.lat
            );

        let previousLon =
            this.encodeCoordinate(
                segments[0].start.lon
            );

        const startPoint = {

            latitude: previousLat,

            longitude: previousLon

        }; 

        //------------------------------------------------
        // Encode segments
        //------------------------------------------------

        for (const segment of segments) {

            const endLat =
                this.encodeCoordinate(
                    segment.end.lat
                );

            const endLon =
                this.encodeCoordinate(
                    segment.end.lon
                );

            const deltaLat =
                endLat - previousLat;

            const deltaLon =
                endLon - previousLon;

            encodedSegments.push({

                id: segment.id,

                deltaLat,

                deltaLon,

                length:
                    Math.round(
                        segment.length * 100
                    ),

                bearing:
                    Math.round(
                        segment.bearing * 100
                    ),

                corridor:
                    Math.round(
                        segment.corridorWidth * 100
                    ),

                curvature:
                    Math.round(
                        segment.curvature * 100
                    ),

                cumulativeDistance:
                    Math.round(
                        segment.cumulativeDistance * 100
                    ),

                speed:
                    Math.round(
                        segment.speedProfile * 100
                    ),

                flags:
                    segment.flags || 0

            });

            previousLat = endLat;
            previousLon = endLon;

        }

        return {

            origin: startPoint,

            segments: encodedSegments

        };

    }

}

module.exports = DeltaEncoder;