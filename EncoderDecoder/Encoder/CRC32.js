/**
 * --------------------------------------------------------
 * CRC32.js
 *
 * IEEE 802.3 CRC32 implementation.
 *
 * Polynomial:
 *      0xEDB88320
 *
 * Used for packet integrity verification.
 * --------------------------------------------------------
 */

class CRC32 {

    static TABLE = CRC32.generateTable();

    /**
     * Generate lookup table.
     */
    static generateTable() {

        const table = new Uint32Array(256);

        for (let i = 0; i < 256; i++) {

            let crc = i;

            for (let j = 0; j < 8; j++) {

                if (crc & 1) {

                    crc =
                        (crc >>> 1) ^
                        0xEDB88320;

                }
                else {

                    crc >>>= 1;

                }

            }

            table[i] = crc >>> 0;

        }

        return table;

    }

    /**
     * Calculate CRC32
     *
     * @param {Buffer} buffer
     *
     * @returns {Number}
     */
    static calculate(buffer) {

        let crc = 0xFFFFFFFF;

        for (const byte of buffer) {

            const index =
                (crc ^ byte) & 0xFF;

            crc =
                (crc >>> 8) ^
                this.TABLE[index];

        }

        return (crc ^ 0xFFFFFFFF) >>> 0;

    }

    /**
     * Append CRC32
     */
    static append(buffer) {

        const crc =
            this.calculate(buffer);

        const output =
            Buffer.alloc(
                buffer.length + 4
            );

        buffer.copy(output);

        output.writeUInt32LE(
            crc,
            buffer.length
        );

        return output;

    }

    /**
     * Verify CRC32
     */
    static verify(buffer) {

        if (buffer.length < 4)
            return false;

        const data =
            buffer.subarray(
                0,
                buffer.length - 4
            );

        const expected =
            buffer.readUInt32LE(
                buffer.length - 4
            );

        const actual =
            this.calculate(data);

        return actual === expected;

    }

}

module.exports = CRC32;