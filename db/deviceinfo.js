const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema(
  {
    deviceId: {
      type: String,
      required: true,
      unique: true,
    },
    name:{
      type:String,
      default:"Smart SOS Device"
    },
    deviceType:{
      type:String,
      default:"Safety Device"
    },
    serialNumber: {
      type: String,
      unique: true,
      required: true,
    },

    imei: {
      type: String,
      default: null,
    },
    macAddress: {
      type: String,
      default: null,
    },

    purchaser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    model: {
      type: String,
      default: "SmartSOS V1",
    },

    firmwareVersion: {
      type: String,
      default: "1.0.0",
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "offline",
        "lost",
        "maintenance"
      ],
      default: "active",
    },

    batteryLevel: {
      type: Number,
      default: 100,
    },

    lastSeenAt: {
      type: Date,
      default: Date.now 
    },

    lastLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      address: String,
      updatedAt: Date,
    },

    lastPhoto: {
      imageUrl: String,
      capturedAt: Date,
    },

    emergencyMode: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Device || mongoose.model("Device", deviceSchema);