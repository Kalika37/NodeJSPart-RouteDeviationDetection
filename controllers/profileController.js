// routes/user.routes.js
const User = require("../db/User");
const { ParseUser } = require("../parsers/user")
const Device = require("../db/deviceinfo.js");
const UserCurrentDevice = require("../db/user_current_device.js");
const { getParsedDevice, getParsedDeviceForAdmin } = require("../parsers/parseDevice.js")
const path = require("path");
const fs = require("fs");


const GetProfule = async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    // console.log(req.uid, req.dbUser)
    const user = await User.findOne({ uid: req.dbUser.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: ParseUser(user),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
const ProfileDashboard = async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    // console.log(req.uid, req.dbUser)
    const user = await User.findOne({ uid: req.dbUser.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const devices = await Device.find({ purchaser: user._id })
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
    const dvs = []
    devices.forEach(device => {
      const parseddev = getParsedDeviceForAdmin(device)
      dvs.push(parseddev)
    })
    res.json({
      success: true,
      user: ParseUser(user),
      devices: dvs,
      currentDevice: getParsedDeviceForAdmin(currentDevice?.device)
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
const ProfileDashboardSelectionUpdate = async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    // console.log(req.uid, req.dbUser)
    const user = await User.findOne({ uid: req.dbUser.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    let currentDevice = await UserCurrentDevice.findOne({
      user: user._id,
    })
      .populate("device")

    if (currentDevice) {
      currentDevice.device = req.body.id
      await currentDevice.save()
    }
    res.json({
      success: true,

    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}
const ProfilePictureUpload = async (req, res) => {
  try {
    if (!req.dbUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }
    const file = req.file || req.files[0]
    const oldPath = file.path;
    const newPath = path.join(
      __dirname,
      `../public/profile-pictures/${req.dbUser.uid}`,
      file.filename
    );
    const dir =
      path.join(__dirname, `../public/profile-pictures/${req.dbUser.uid}`);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(oldPath, newPath);
    const profilePicture =
      `/profile-pictures/${req.dbUser.uid}/${file.filename}`
    // console.log(req.uid, req.dbUser)
    const user = await User.findOne({ uid: req.dbUser.uid });
    try {
      const filePath = path.join(
        __dirname,
        `../public`,
        user.profilePicture
      )
      await await fs.promises.unlink(filePath);
    } catch (err) {

    }
    user.profilePicture = profilePicture
    await user.save()
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.json({
      success: true,

    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
}

module.exports = { GetProfule, ProfileDashboard, ProfileDashboardSelectionUpdate, ProfilePictureUpload };
