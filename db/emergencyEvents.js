import mongoose from "mongoose";

const emergencyEventSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventType: {
      type: String,
      enum: [
        "sos",
        "fall_detected",
        "panic",
        "battery_low"
      ],
      required: true,
    },

    location: {
      latitude: Number,
      longitude: Number,
      address: String,
    },

    photo: String,

    resolved: {
      type: Boolean,
      default: false,
    },

    resolvedAt: Date,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "EmergencyEvent",
  emergencyEventSchema
);