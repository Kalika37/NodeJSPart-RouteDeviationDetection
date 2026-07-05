const mongoose = require("mongoose");

const emergencyContactSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    relationship: {
      type: String,
      enum: [
        'Father',
        'Mother',
        'Brother',
        'Sister',
        'Grandfather',
        'Grandmother',
        'Uncle',
        'Aunt',
        'Guardian',
        'Friend',
        'Relative',
        'Neighbor',
        'Teacher',
        'Caregiver',
        'Babysitter',
        'Other',
      ],
      default: "Other",
    },
    email: {
      type: String,
      default: "",
      trim: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },

    receiveSMS: {
      type: Boolean,
      default: true,
    },

    receiveCall: {
      type: Boolean,
      default: true,
    },

    receivePushNotification: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema
);