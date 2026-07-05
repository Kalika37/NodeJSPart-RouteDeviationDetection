/**
 * --------------------------------------------------------
 * PackageValidator.js
 *
 * Validates Route Package
 * before decoding.
 * --------------------------------------------------------
 */

const CRC32 = require("./CRC32");

class PackageValidator {

    static MAGIC = 0x52545031;

    static VERSION = 1;

    static HEADER_SIZE = 21;

    static SEGMENT_SIZE = 25;

    /**
     * Validate packet.
     */

    static validate(buffer) {

        if (!Buffer.isBuffer(buffer)) {

            throw new Error(
                "Input must be Buffer."
            );

        }

        //--------------------------------------------------
        // Minimum Size
        //--------------------------------------------------

        if (
            buffer.length <
            this.HEADER_SIZE + 4
        ) {

            throw new Error(
                "Packet too small."
            );

        }

        //--------------------------------------------------
        // CRC
        //--------------------------------------------------

        if (
            !CRC32.verify(buffer)
        ) {

            throw new Error(
                "CRC Verification Failed."
            );

        }

        //--------------------------------------------------
        // Read Header
        //--------------------------------------------------

        const magic =
            buffer.readUInt32LE(0);

        const version =
            buffer.readUInt8(4);

        const routeId =
            buffer.readUInt16LE(5);

        const segmentCount =
            buffer.readUInt16LE(7);

        const scale =
            buffer.readUInt32LE(9);

        //--------------------------------------------------
        // Magic Number
        //--------------------------------------------------

        if (
            magic !== this.MAGIC
        ) {

            throw new Error(
                "Invalid Magic Number."
            );

        }

        //--------------------------------------------------
        // Version
        //--------------------------------------------------

        if (
            version !== this.VERSION
        ) {

            throw new Error(
                "Unsupported Version."
            );

        }

        //--------------------------------------------------
        // Route ID
        //--------------------------------------------------

        if (
            routeId === 0
        ) {

            throw new Error(
                "Invalid Route ID."
            );

        }

        //--------------------------------------------------
        // Segment Count
        //--------------------------------------------------

        if (
            segmentCount === 0
        ) {

            throw new Error(
                "No Segments."
            );

        }

        //--------------------------------------------------
        // Scale
        //--------------------------------------------------

        if (
            scale !== 10000000
        ) {

            throw new Error(
                "Coordinate Scale Invalid."
            );

        }

        //--------------------------------------------------
        // Packet Size
        //--------------------------------------------------

        const expectedSize =
            this.HEADER_SIZE +
            segmentCount *
            this.SEGMENT_SIZE +
            4;

        if (
            buffer.length !==
            expectedSize
        ) {

            throw new Error(
                "Packet Length Mismatch."
            );

        }

        return {

            valid: true,

            version,

            routeId,

            segmentCount

        };

    }

}

module.exports =
PackageValidator;