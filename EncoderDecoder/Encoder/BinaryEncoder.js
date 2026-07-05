/**
 * -------------------------------------------------------
 * BinaryEncoder.js
 *
 * Converts Delta Encoded Route Package
 * into compact binary.
 * -------------------------------------------------------
 */

class BinaryEncoder {

    static MAGIC = 0x52545031;   // RTP1

    static SCALE = 10000000;

    static HEADER_SIZE = 21;

    static SEGMENT_SIZE = 25;

    static encode(routePackage) {

        const count =
            routePackage.segments.length;

        const totalSize =
            this.HEADER_SIZE +
            count * this.SEGMENT_SIZE;

        const buffer =
            Buffer.alloc(totalSize);

        let offset = 0;

        //--------------------------------------------------
        // HEADER
        //--------------------------------------------------

        buffer.writeUInt32LE(
            this.MAGIC,
            offset
        );
        offset += 4;

        buffer.writeUInt8(
            routePackage.header.version,
            offset
        );
        offset += 1;

        buffer.writeUInt16LE(
            routePackage.header.routeId,
            offset
        );
        offset += 2;

        buffer.writeUInt16LE(
            count,
            offset
        );
        offset += 2;

        buffer.writeUInt32LE(
            this.SCALE,
            offset
        );
        offset += 4;

        buffer.writeInt32LE(
            routePackage.origin.latitude,
            offset
        );
        offset += 4;

        buffer.writeInt32LE(
            routePackage.origin.longitude,
            offset
        );
        offset += 4;

        //--------------------------------------------------
        // SEGMENTS
        //--------------------------------------------------

        for (const s of routePackage.segments) {
            console.log(s.deltaLat)
            buffer.writeInt32LE(
                s.deltaLat,
                offset
            );
            offset += 4;

            buffer.writeInt32LE(
                s.deltaLon,
                offset
            );
            offset += 4;

            buffer.writeUInt32LE(
                s.length,
                offset
            );
            offset += 4;

            buffer.writeUInt16LE(
                s.bearing,
                offset
            );
            offset += 2;

            buffer.writeUInt16LE(
                s.corridor,
                offset
            );
            offset += 2;

            buffer.writeUInt16LE(
                s.curvature,
                offset
            );
            offset += 2;

            buffer.writeUInt32LE(
                s.cumulativeDistance,
                offset
            );
            offset += 4;

            buffer.writeUInt16LE(
                s.speed,
                offset
            );
            offset += 2;

            buffer.writeUInt8(
                s.flags,
                offset
            );
            offset += 1;

        }

        return buffer;

    }

}

module.exports = BinaryEncoder;