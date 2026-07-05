/**
 * ------------------------------------------------------------
 * RouteUploader.js
 * ------------------------------------------------------------
 *
 * Uploads compressed route package
 * to ESP32.
 *
 * Supports HTTP Upload.
 *
 * ------------------------------------------------------------
 */

const fs = require("fs");

class RouteUploader {

    /**
     * Upload package
     *
     * @param {String} url
     * @param {Buffer} packet
     */
    static async upload(url, packet) {

        if (!Buffer.isBuffer(packet)) {

            throw new Error(
                "Packet must be Buffer."
            );

        }

        const response =
            await fetch(url, {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/octet-stream",

                    "Content-Length":
                        packet.length.toString()

                },

                body: packet

            });

        if (!response.ok) {

            throw new Error(
                `Upload failed (${response.status})`
            );

        }

        return response.text();

    }

    /**
     * Save packet locally.
     */
    static save(fileName, packet) {

        fs.writeFileSync(
            fileName,
            packet
        );

    }

}

module.exports = RouteUploader;