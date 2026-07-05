const express = require("express");
const router = express.Router();
const { RouteEncoder, RouteDecoder } = require('../EncoderDecoder/main')
const Device = require("../db/deviceinfo.js");

// Add road (from OSM importer)
router.post("/Upload", async (req, res) => {
  try {
    const routes = req.body.routes
    console.log(routes)
    // const encoder=new RouteEncoder(routes)
    // const pkg=encoder.encode()
    // const decoder=new RouteDecoder(encoder.encode().packet)
    // console.log(decoder.decode(pkg.packet).slice(0, 3).reverse())
    // console.log(encoder.segments.slice(0, 3))
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});
router.post("/Fetch", async (req, res) => {
  try {
    const routes = req.body.routes
    console.log(routes)
    // const encoder=new RouteEncoder(routes)
    // const pkg=encoder.encode()
    // const decoder=new RouteDecoder(encoder.encode().packet)
    // console.log(decoder.decode(pkg.packet).slice(0, 3).reverse())
    // console.log(encoder.segments.slice(0, 3))
    res.status(200).json({ success: true });
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message });
  }
});
router.post("/getCurrentRoute", async (req, res) => {
  try {
    // const device = await Device.find()
    // console.log(devices)

    const device = await Device.findOne({
                    _id:
                        req.body.deviceId,
                });
    console.log(device)
    res.status(200).json({
      success: true, start: {
        latitude: 27.661139,
        longitude: 85.373988,
      },
      end: {
        latitude: 27.694583,
        longitude: 85.381716
      },
      index:0,
      hometoschool:false
    });
  } catch (err) {
    console.log(err, 'error')
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;