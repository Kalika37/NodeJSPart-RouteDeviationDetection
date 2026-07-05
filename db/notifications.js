const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      default: null,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "sos",
        "fall_detected",
        "device_online",
        "device_offline",
        "battery_low",
        "location_update",
        "route_deviated",
        "contact_removed",
        "announcement",
        "system"
      ],
      default: "system",
    },

    icon: {
      type: String,
      default: "Bell",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    actionUrl: {
      type: String,
      default: "",
    },

    metadata: {
      latitude: Number,
      longitude: Number,
      eventId: String,
      imageUrl: String,
    },
  },
  {
    timestamps: true,
  }
);
module.exports=mongoose.model(
  "Notification",
  notificationSchema
)