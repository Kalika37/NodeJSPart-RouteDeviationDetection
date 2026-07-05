const zlib = require("zlib");

class Compressor {

    static compress(buffer) {
        return zlib.deflateSync(buffer);
    }

    static decompress(buffer) {
        return zlib.inflateSync(buffer);
    }

}

module.exports = Compressor;