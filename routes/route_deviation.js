const express = require("express");
const router = express.Router();
const { RouteEncoder, RouteDecoder } = require('../EncoderDecoder/main')
const Device = require("../db/deviceinfo.js");

// Add road (from OSM importer)
router.post("/Upload", async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to save route.",
        error: error.message,
      });
    }
    const {
      name,
      direction,
      points,
      totalDistance,
      estimatedDuration,
      routeIndex
    } = req.body;

    const user = await User.findOne({ uid: req.dbUser.uid });
    let currentDevice = await UserCurrentDevice.findOne({
      user: user._id,
    })
      .populate("device")
      .lean()
    if (!currentDevice && devices) {
      if (devices.length > 0) {
        currentDevice = await UserCurrentDevice.create({ device: devices[0]._id, user: user._id })
        await currentDevice.populate("device")
      }
    }
    if (!currentDevice) {
      return res.status(400).json({
        success: false,
        message: "You have not purchased any devices.",
      });
    }

    if (!Array.isArray(points) || points.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Route must contain at least 2 points.",
      });
    }
    const device = currentDevice.device._id
    let route = await Route.findOne({ device });
    console.log({
      device,
      name,
      direction,
      points,
      routeIndex,
      totalDistance,
      estimatedDuration,
    })
    if (!route) {
      // Create new route
      route = await Route.create({
        device,
        name,
        routeIndex,
        direction,
        points,
        totalDistance,
        estimatedDuration,
      });

      return res.status(200).json({
        success: true,
        message: "Route created successfully.",
        route,
      });
    }
    // Update existing route
    route.name = name ?? route.name;
    route.direction = direction ?? route.direction;
    route.routeIndex = routeIndex ?? route.routeIndex;
    route.points = points;
    route.totalDistance = totalDistance;
    route.estimatedDuration = estimatedDuration;

    await route.save();

    return res.status(200).json({
      success: true,
      message: "Route updated successfully.",
      route,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to save route.",
      error: error.message,
    });
  }
});




router.post("/Fetch", async (req, res) => {
  try {

    const user = await User.findOne({ uid: req.dbUser.uid });
    let currentDevice = await UserCurrentDevice.findOne({
      user: user._id,
    })
      .populate("device")
      .lean()
    if (!currentDevice && devices) {
      if (devices.length > 0) {
        currentDevice = await UserCurrentDevice.create({ device: devices[0]._id, user: user._id })
        await currentDevice.populate("device")
      }
    }
    if (!currentDevice) {
      return res.status(400).json({
        success: false,
        message: "You have not purchased any devices.",
      });
    }
    const device = currentDevice.device._id
    let route = await Route.findOne({ device });
    if (!route) {
      return res.status(400).json({
        success: false,
        message: "Route Not Found.",
      });
    }
    const encoder = new RouteEncoder(route.points)
    const pkg = encoder.encode()

    res.status(200);

    res.set({
      "Content-Type": "application/octet-stream",
      "Content-Length": pkg.packet.length
    });

    return res.send(pkg.packet);
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
    res.status(200).json({
      success: true, start: {
        latitude: 27.661139,
        longitude: 85.373988,
      },
      end: {
        latitude: 27.694583,
        longitude: 85.381716
      },
      index: 0,
      hometoschool: false
    });
  } catch (err) {
    console.log(err, 'error')
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;