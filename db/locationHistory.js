const mongoose = require("mongoose");

const deviceLocationSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    latitude: {
      type: Number,
      required: true,
    },

    longitude: {
      type: Number,
      required: true,
    },

    accuracy: Number,

    speed: Number,

    batteryLevel: Number,

    address: String,

    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "DeviceLocation",
  deviceLocationSchema
);