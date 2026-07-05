/**
 * ---------------------------------------------------------
 * BinaryDecoder.js
 *
 * Decodes a binary route packet into a
 * delta-encoded route object.
 * ---------------------------------------------------------
 */

class BinaryDecoder {

    static MAGIC = 0x52545031;

    static HEADER_SIZE = 21;

    static SEGMENT_SIZE = 25;

    static decode(buffer) {

        let offset = 0;

        //---------------- Header ----------------

        const magic = buffer.readUInt32LE(offset);
        offset += 4;

        const version = buffer.readUInt8(offset);
        offset += 1;

        const routeId = buffer.readUInt16LE(offset);
        offset += 2;

        const segmentCount = buffer.readUInt16LE(offset);
        offset += 2;

        const scale = buffer.readUInt32LE(offset);
        offset += 4;

        const originLat = buffer.readInt32LE(offset);
        offset += 4;

        const originLon = buffer.readInt32LE(offset);
        offset += 4;

        //---------------- Segments ----------------

        const segments = [];

        for (let i = 0; i < segmentCount; i++) {

            const deltaLat = buffer.readInt32LE(offset);
            offset += 4;

            const deltaLon = buffer.readInt32LE(offset);
            offset += 4;

            const length = buffer.readUInt32LE(offset);
            offset += 4;

            const bearing = buffer.readUInt16LE(offset);
            offset += 2;

            const corridor = buffer.readUInt16LE(offset);
            offset += 2;

            const curvature = buffer.readUInt16LE(offset);
            offset += 2;

            const cumulativeDistance = buffer.readUInt32LE(offset);
            offset += 4;

            const speed = buffer.readUInt16LE(offset);
            offset += 2;

            const flags = buffer.readUInt8(offset);
            offset += 1;

            segments.push({

                id: i,

                deltaLat,

                deltaLon,

                length,

                bearing,

                corridor,

                curvature,

                cumulativeDistance,

                speed,

                flags

            });

        }

        return {

            header: {

                magic,

                version,

                routeId,

                segmentCount,

                scale

            },

            origin: {

                latitude: originLat,

                longitude: originLon

            },

            segments

        };

    }

}

module.exports = BinaryDecoder;