
const fs = require("fs");
const  douglasPeucker=require('./route-simplification.js')
const  buildRouteSegments=require('./segmentation.js')
const RoutePackageBuilder =require("./Encoder/RoutePackageBuilder.js")
const DeltaEncoder =require("./Encoder/DeltaEncoder.js")
const BinaryEncoder =require("./Encoder/BinaryEncoder.js")
const CRC32 =require("./Encoder/CRC32.js")
const Compressor =require("./Encoder/Compressor.js")
const RouteUploader =require("./Encoder/RouteUploader.js")



//decoder packages 
const PackageValidator =
    require("./Encoder/PackageValidator");

const BinaryDecoder =
    require("./Decoder/BinaryDecoder");

const DeltaDecoder =
    require("./Decoder/DeltaDecoder");

 


class RouteEncoder {
    constructor(routes) {
        this.routes = routes
    }
    encode() {

        const segments = buildRouteSegments(this.routes)
        const pkg =
            RoutePackageBuilder.build(
                101,
                segments
            );
        this.segments=segments
        const delta =
            DeltaEncoder.encode(
                pkg.segments
            );

        pkg.origin = delta.origin;
        pkg.segments = delta.segments;

        const binary =
            BinaryEncoder.encode(pkg);

        const packet =
            CRC32.append(binary);
        pkg.packet=packet
        RouteUploader.save(
            "route.bin",
            packet
        );
        return pkg
    }
}


class RouteDecoder {
    constructor(packet) {
        this.packet = packet





    }
    decode() {
        PackageValidator.validate(this.packet);

        // Decode Binary
        const binary =
            BinaryDecoder.decode(this.packet);

        // Decode Delta
        const route =
            DeltaDecoder.decode(binary);

        // Original Route
        return route
    }
}

module.exports={RouteEncoder,RouteDecoder}