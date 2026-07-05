const mongoose = require('mongoose');

const routePointSchema = new mongoose.Schema(
  {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Device',
      required: true,
      unique: true, // One route per device
    },
    name: {
      type: String,
      default: 'Default Route',
    },
    direction: {
      type: String,
      enum: ['HOME_TO_SCHOOL', 'SCHOOL_TO_HOME'],
      default: 'HOME_TO_SCHOOL',
    },

    points: {
      type: [routePointSchema],
      required: true,
    },

    totalDistance: Number,
    estimatedDuration: Number,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Route', routeSchema);