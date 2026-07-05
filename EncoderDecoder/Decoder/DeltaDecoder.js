/**
 * --------------------------------------------------------
 * DeltaDecoder.js
 *
 * Converts delta encoded coordinates
 * back into GPS coordinates.
 *
 * Reverse of DeltaEncoder.js
 * --------------------------------------------------------
 */

function createBoundingBox(start, end) {

    return {

        minLat: Math.min(start.lat, end.lat),

        maxLat: Math.max(start.lat, end.lat),

        minLon: Math.min(start.lon, end.lon),

        maxLon: Math.max(start.lon, end.lon)

    };

}

class DeltaDecoder {

    static SCALE = 10000000;

    /**
     * Decode delta route
     *
     * @param {Object} deltaRoute
     *
     * @returns {Array}
     */
    static decode(deltaRoute) {

        if (!deltaRoute.origin) {

            throw new Error(
                "Origin missing."
            );

        }

        let currentLat =
            deltaRoute.origin.latitude;

        let currentLon =
            deltaRoute.origin.longitude;

        const segments = [];

        for (const segment of deltaRoute.segments) {

            const startLat = currentLat;
            const startLon = currentLon;


            currentLat += segment.deltaLat;
            currentLon += segment.deltaLon;

            const endLat = currentLat;
            const endLon = currentLon;
            const boundingBox = {

                minLat: Math.min(
                    startLat / this.SCALE,
                    endLat / this.SCALE
                ),

                maxLat: Math.max(
                    startLat / this.SCALE,
                    endLat / this.SCALE
                ),

                minLon: Math.min(
                    startLon / this.SCALE,
                    endLon / this.SCALE
                ),

                maxLon: Math.max(
                    startLon / this.SCALE,
                    endLon / this.SCALE
                )

            };
            const previousSegment =
                segment.id === 0
                    ? null
                    : segment.id - 1;
            const nextSegment =
                segment.id === deltaRoute.segments.length - 1
                    ? null
                    : segment.id + 1;
            

            segments.push({

                id: segment.id,

                start: {

                    lat: startLat / this.SCALE,

                    lon: startLon / this.SCALE

                },

                end: {

                    lat: endLat / this.SCALE,

                    lon: endLon / this.SCALE

                },

                length:
                    segment.length / 100,

                bearing:
                    segment.bearing / 100,

                cumulativeDistance:
                    segment.cumulativeDistance / 100,

                corridorWidth:
                    segment.corridor / 100,

                speedProfile:
                    segment.speed / 100,

                curvature:
                    segment.curvature / 100,

                boundingBox,

                previousSegment,

                nextSegment,

                flags:
                    segment.flags

            });

        }

        return segments;

    }

}

module.exports = DeltaDecoder;