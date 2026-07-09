const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: ["local", "google", "facebook", "github"],
    default: "local",
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    }
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  adminAccess: {
    type: Boolean,
    default: false,
  },
  phone: {
    type: String,
    required: function () {
      return this.authProvider === "local";
    }
  },

  // 📸 Profile data
  profilePicture: {
    type: String // URL (stored in Firebase Storage or Cloudinary)
  },
  bio: {
    type: String,
    default: ""
  },
  refreshToken : {
    type: String,
    default: ""
  },
  status: {
    type: String,
    default: "active"
  },

  // 📱 Devices user is using
  devices: [
    {
      deviceId: String,        // browser/device identifier (NOT IP)
      platform: String,        // Android / iOS / Web
      fcmToken: String,
      lastActive: Date
    }
  ],

  // 📍 Latest location
  location: {
    lat: Number,
    lng: Number,
    updatedAt: Date
  }

}, { timestamps: true });


userSchema.virtual("purchasedDevicesCount", {
  ref: "Device",
  localField: "_id",
  foreignField: "purchaser",
  count: true
});
userSchema.set("toJSON", {
  virtuals: true
});

userSchema.set("toObject", {
  virtuals: true
});
module.exports =
  mongoose.models.User ||
  mongoose.model("User", userSchema);
