const User = require("../db/User");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const admin = require("../config/firebase");

const validatePassword = (password, userData) => {
  // Strong password regex
  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  if (!strongPassword.test(password)) {
    return {
      valid: false,
      field: "password",
      message:
        "Password must contain at least 8 characters, uppercase, lowercase, number, and special character.",
    };
  }

  const passwordLower = password.toLowerCase();

  const forbiddenValues = [
    userData.name,
    userData.email?.split("@")[0], // email username
    userData.phone,
    userData.bio,
  ];

  for (const value of forbiddenValues) {
    if (!value) continue;

    const normalizedValue = value.toLowerCase().trim();

    if (
      passwordLower.includes(normalizedValue) ||
      normalizedValue.includes(passwordLower)
    ) {
      return {
        valid: false,
        field: "password",
        message:
          "Password must not contain your personal information such as name, email, phone, or bio.",
      };
    }
  }

  return {
    valid: true,
  };
};


const login = async (req, res) => {
  if (!req.headers.origin && process.env.IS_WEP_NATIVE_TESTING) {
    return res.status(200).json({
      success: true,
      message: "Login successful",
      redirect: "/",
    })
  }
  try {
    const { email, password, fcmToken } = req.body;
    getAllUsers()
    console.log(email,password)
    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );
    console.log(bcrypt.hash(password,10))
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate JWT

    req.session.userId = user._id;

    req.session.save(async (err) => {
      // console.log("save error:", err);
      // console.log("session:", req.session);
      if (!process.env.IS_WEP_NATIVE) {
        const idToken = fcmToken;
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const sessionCookie = await admin
          .auth()
          .createSessionCookie(idToken, { expiresIn });
        res.cookie("session", sessionCookie, {
          maxAge: expiresIn,
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          secure: process.env.NODE_ENV === "production", // true in production HTTPS
        });
      }
      res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        redirect: "/"
      });
      // console.log("login success")
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const loginWithGoogle = async (req, res) => {
  try {

    const { name, email, phone, location, idToken, profilePicture } = req.body;


    let devices = [];

    if (req.body.devices) {
      devices = JSON.parse(req.body.devices);
    }
    // Validation

    // Check existing user
    const existingUser = await User.findOne({ email });
    let newuser = existingUser
    if (!existingUser) {

      const uid = crypto.randomUUID();

      //await User.create(
      newuser = await User.create({
        uid,
        name,
        email,
        phone,
        profilePicture,
        devices,
        location,
        authProvider: "google",

      }
      );
    }
    const user = existingUser || newuser



    // Create user


    req.session.userId = user._id;
    req.session.save(async (err) => {
      // console.log("save error:", err);
      // console.log("session:", req.session);

      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

      const sessionCookie = await admin
        .auth()
        .createSessionCookie(idToken, { expiresIn });
      res.cookie("session", sessionCookie, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: expiresIn,
      });

      res.status(200).json({
        success: true,
        message: "Registration successful",
        idToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        redirect: "/"
      });
    })
  } catch (error) {
    console.error(error, "failed");

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getAllUsers = async () => {
  try {
    const users = await User.find();

    console.table(
      users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }))
    );
  } catch (error) {
    console.error(error);
  }
};
const register = async (req, res) => {
  try {

    const { name, email, phone, location, bio, password, idToken } = req.body;


    let devices = [];

    if (req.body.devices) {
      devices = JSON.parse(req.body.devices);
    }
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        field: "email",
        message: "Email already registered",
      });
    }
    const existingUserwithPhone = await User.findOne({ phone });

    if (existingUserwithPhone) {
      return res.status(409).json({
        success: false,
        field: "phone",
        message: "Number already registered",
      });
    }
    const validation = validatePassword(password, {
      name,
      email,
      phone,
      bio,
    });

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        field: "password",
        message: validation.message,
      });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const uid = crypto.randomUUID();
    const oldPath = req.files[0].path;
    const newPath = path.join(
      __dirname,
      `../public/profile-pictures/${uid}`,
      req.files[0].filename
    );
    const dir =
      path.join(__dirname, `../public/profile-pictures/${uid}`);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.renameSync(oldPath, newPath);
    const profilePicture =
      `/profile-pictures/${uid}/${req.files[0].filename}`
    const user = await User.create({
      uid,
      name,
      email,
      phone,
      bio,
      profilePicture,
      password: hashedPassword,
      devices,
      location
    });


    req.session.userId = user._id;
    req.session.save(async (err) => {
      // console.log("save error:", err);
      // console.log("session:", req.session);

      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

      const sessionCookie = await admin
        .auth()
        .createSessionCookie(idToken, { expiresIn });
      res.cookie("session", sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        secure: process.env.NODE_ENV === "production", // true in production HTTPS

      });
      res.status(200).json({
        success: true,
        message: "Registration successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        redirect: "/"
      });
    })
  } catch (error) {
    console.error(error, "failed");

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateDevice = async (req, res) => {
  try {
    // console.log(req.user)
    if (!req.headers.origin && process.env.IS_WEP_NATIVE_TESTING) {
      return res.json({
        success: true,
      });
    }
    const userId = req.dbUser.id;
    const {
      deviceId,
      platform,
      fcmToken,
      location,
    } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const existingDevice = user.devices.find(
      (d) => d.deviceId === deviceId
    );

    if (existingDevice) {
      existingDevice.platform = platform;
      existingDevice.fcmToken = fcmToken;
      existingDevice.lastActive = new Date();
    } else {
      user.devices.push({
        deviceId,
        platform,
        fcmToken,
        lastActive: new Date(),
      });
    }

    user.location = {
      lat: location.lat,
      lng: location.lng,
      updatedAt: new Date(),
    };
    // console.log(user)
    await user.save();

    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: true,
    });
  }
};

const Logout = async (req, res) => {
  try {
    console.log(req.body)
    res.clearCookie("session");
    const userId = req.dbUser.id;
    const { deviceId } = req.body;

    await User.updateOne(
      { _id: userId },
      {
        $pull: {
          devices: { deviceId },
        },
      }
    );
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const CheckAuthorization = async (req, res) => {
  if (!req.headers.origin && process.env.IS_WEP_NATIVE_TESTING) {
    return res.status(200).json({
      authenticated: true,
      adminAccess: true,
      message: "Logged In",
    });
  }
  if (req.dbUser) {
    if (req.dbUser.adminAccess) {
      return res.status(200).json({
        authenticated: true,
        adminAccess: true,
        message: "Logged In",
      });
    }
    return res.status(200).json({
      authenticated: true,
      adminAccess: false,
      message: "Logged In",
    });
  }

  return res.status(200).json({
    authenticated: false,
    message: "Logged Out",
  });



}
module.exports = { login, register, updateDevice, Logout, CheckAuthorization, loginWithGoogle };



