/**
 * ------------------------------------------------------------
 * RoutePackageBuilder.js
 * ------------------------------------------------------------
 * Creates a production-ready route package.
 *
 * Input:
 *      Array<RouteSegment>
 *
 * Output:
 *      RoutePackage Object
 *
 * This package is later consumed by:
 *
 *      DeltaEncoder
 *      BinaryEncoder
 *      CRC32
 *      Compressor
 *
 * ------------------------------------------------------------
 */

class RoutePackageBuilder {

    /**
     * Package format version.
     */
    static VERSION = 1;

    /**
     * Build complete route package.
     *
     * @param {Number} routeId
     * @param {Array} segments
     *
     * @returns {Object}
     */
    static build(routeId, segments) {

        this.validate(routeId, segments);

        const statistics =
            this.generateStatistics(segments);

        const header =
            this.generateHeader(
                routeId,
                statistics
            );

        return {

            header,

            statistics,

            segments

        };

    }

    /**
     * Validate input.
     */
    static validate(routeId, segments) {

        if (!Number.isInteger(routeId)) {

            throw new Error(
                "Invalid Route ID"
            );

        }

        if (!Array.isArray(segments)) {

            throw new Error(
                "Segments must be an array."
            );

        }

        if (segments.length === 0) {

            throw new Error(
                "Route contains no segments."
            );

        }

    }

    /**
     * Create package header.
     */
    static generateHeader(
        routeId,
        statistics
    ) {

        return {

            magic: "RTP1",

            version:
                this.VERSION,

            routeId,

            createdAt:
                Date.now(),

            segmentCount:
                statistics.segmentCount

        };

    }

    /**
     * Calculate useful route statistics.
     */
    static generateStatistics(
        segments
    ) {

        let totalLength = 0;

        let minLat = Infinity;
        let maxLat = -Infinity;

        let minLon = Infinity;
        let maxLon = -Infinity;

        let maxSpeed = 0;

        let averageBearing = 0;

        let averageCorridor = 0;

        for (const segment of segments) {

            totalLength +=
                segment.length;

            averageBearing +=
                segment.bearing;

            averageCorridor +=
                segment.corridorWidth;

            maxSpeed = Math.max(
                maxSpeed,
                segment.speedProfile
            );

            minLat = Math.min(
                minLat,
                segment.start.lat,
                segment.end.lat
            );

            maxLat = Math.max(
                maxLat,
                segment.start.lat,
                segment.end.lat
            );

            minLon = Math.min(
                minLon,
                segment.start.lon,
                segment.end.lon
            );

            maxLon = Math.max(
                maxLon,
                segment.start.lon,
                segment.end.lon
            );

        }

        return {

            segmentCount:
                segments.length,

            totalLength,

            averageBearing:
                averageBearing /
                segments.length,

            averageCorridor:
                averageCorridor /
                segments.length,

            maxSpeed,

            boundingBox: {

                minLat,

                maxLat,

                minLon,

                maxLon

            }

        };

    }

}

module.exports =
RoutePackageBuilder;