const mongoose = require('mongoose');

const userCurrentDeviceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    device: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports =
  mongoose.model(
  "UserCurrentDevice",
  userCurrentDeviceSchema
);