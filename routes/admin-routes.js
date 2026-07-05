const express = require("express");
const Device = require("../db/deviceinfo.js");
const User = require("../db/user.js");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const mongoose = require("mongoose");

const { getParsedDeviceForAdmin } = require("../parsers/parseDevice.js")
const { ParseUser } = require("../parsers/user.js")



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


const generatePassword = (userData = {}) => {
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercase = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const specials =
        "@$!%*?&^#()_+-=[]{};':\"\\|,.<>/?";

    const all =
        uppercase +
        lowercase +
        numbers +
        specials;

    const randomChar = (chars) =>
        chars[Math.floor(Math.random() * chars.length)];

    while (true) {
        const passwordChars = [
            randomChar(uppercase),
            randomChar(lowercase),
            randomChar(numbers),
            randomChar(specials),
        ];

        const length = 16;

        for (let i = passwordChars.length; i < length; i++) {
            passwordChars.push(randomChar(all));
        }

        // Shuffle
        for (let i = passwordChars.length - 1; i > 0; i--) {
            const j = Math.floor(
                Math.random() * (i + 1)
            );

            [passwordChars[i], passwordChars[j]] = [
                passwordChars[j],
                passwordChars[i],
            ];
        }

        const password = passwordChars.join("");

        const validation = validatePassword(
            password,
            userData
        );

        if (validation.valid) {
            return password;
        }
    }
};


router.post("/users", async (req, res) => {
    try {
        if (req.dbUser.adminAccess) {
            const users = [];
            const dbusers = await User.find()
                .populate("devices").populate("purchasedDevicesCount");;

            for (let i = 0; i < dbusers.length; i++) {
                const user = dbusers[i]
                let pp = user.profilePicture
                if (!user.profilePicture.startsWith("http")) {
                    pp = process.env.BACKEND_HOST + user.profilePicture
                }
                let role = "user"
                if (user.adminAccess) {
                    role = "Admin"
                }
                users.push({
                    id: user._id,
                    devices: user.purchasedDevicesCount,
                    status: user.status,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                    authProvider: user.authProvider,
                    profilePicture: pp,
                    role,
                    location: user.location,
                    bio: user.bio,
                    adminAccess: user.adminAccess

                })
            }
            return res.status(200).json({
                success: true,
                users,
            });
        }
    } catch (Err) {

    }
    return res.status(400).json({
        success: false,
    })
});
router.post("/users/add", async (req, res) => {
    try {

        const { name, email, phone, location, bio } = req.body;


        let devices = [];

        // Validation
        if (!name || !email) {
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
                errors: {
                    email: "Email already registered"
                },
            });
        }
        const existingUserwithPhone = await User.findOne({ phone });

        if (existingUserwithPhone) {
            return res.status(409).json({
                success: false,
                errors: {
                    phone: "Number already registered"
                },
            });
        }
        const validation = generatePassword({
            name,
            email,
            phone,
            bio,
        });


        // Hash password
        const hashedPassword = await bcrypt.hash(validation, 10);


        // sms this generate password to the user sms


        // ---> send password to user 






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
            location
        });
        return res.status(200).json({
            success: true,
            message: "Registration successful",
            user: ParseUser(user),
        });
    } catch (error) {
        console.error(error, "failed");

        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}
)



router.post("/devices", async (req, res) => {
    try {
        if (req.dbUser.adminAccess) {
            const devices = await Device.find()
                .populate("assignedUser");
            devices.forEach(device => {
                if (!device.assignedUser) {
                    device.assignedUser = device.purchaser
                }
            })
            const dvs=[]
            devices.forEach(device=>{
                dvs.push(getParsedDeviceForAdmin(device))
            }) 
            return res.json({
                success: true,
                devices:dvs,
            });
        }
    } catch (Err) {
        console.log(Error)
    }
    return res.status(400).json({
        success: false,
    })

});
router.post("/devices/add", async (req, res) => {
    try {
        const { serialNumber, deviceId, imei, model, firmwareVersion, assignedUser, purchaser, notes } = req.body
        const errors = {}
        let proceed = true
        if (!serialNumber) {
            errors.serialNumber = "This field is required"
            proceed = false
        }
        if (!deviceId) {
            errors.deviceId = "This field is required"
            proceed = false
        }
        if (!imei) {
            errors.imei = "This field is required"
            proceed = false
        }
        if (!mongoose.Types.ObjectId.isValid(assignedUser)) {
            errors.assignedUser = "Invalid User ID"
            proceed = false
        }
        if (!mongoose.Types.ObjectId.isValid(purchaser)) {
            errors.purchaser = "Invalid User ID"
            proceed = false
        }
        if (!proceed) {
            return res.status(200).json({
                success: false,
                message: "All fields are required",
                errors
            });
        }

        const existingDeviceId = await Device.findOne({ deviceId });
        if (existingDeviceId) {
            
            errors.deviceId = "Device Identity is already registered"
            return res.status(200).json({
                success: false,
                errors
            });
        }
        const existingDeviceserialNumber = await Device.findOne({ serialNumber });
        if (existingDeviceserialNumber) {
            errors.serialNumber = "Serial Number is already registered"
            return res.status(200).json({
                success: false,
                errors
            });
        }
        const purchaserUser = await User.findOne({ _id: purchaser });
        if (!purchaserUser) {
            errors.purchaser = "The entered id doesn't belongs to any user in User Database"
            return res.status(200).json({
                success: false,
                errors
            });
        }

        const assignedUserInDb = await User.findOne({ _id: assignedUser });
        if (!assignedUserInDb) {
            errors.assignedUser = "The entered id doesn't belongs to any user in User Database"
            return res.status(200).json({
                success: false,
                errors
            });
        }
        console.log(assignedUserInDb, purchaserUser, existingDeviceserialNumber, existingDeviceId)
        const device = await Device.create({
            serialNumber, deviceId, imei, model, firmwareVersion, assignedUser, purchaser, notes
        })
        await device.populate([
            {
                path: "assignedUser",
                select: "name email phone profilePicture location"
            },
            {
                path: "purchaser",
                select: "name email phone profilePicture"
            }
        ]);
        return res.status(200).json({
            success: true,
            device: getParsedDeviceForAdmin(device)
        })



    } catch (Err) {
        console.log(Err)
    }
    return res.status(400).json({
        success: false,
    })

});
router.put("/devices/:id", async (req, res) => {
    try {
        const { serialNumber, deviceId, imei, model, firmwareVersion, assignedUser, purchaser, notes } = req.body
        const errors = {}
        let proceed = true
        if (!serialNumber) {
            errors.serialNumber = "This field is required"
            proceed = false
        }
        if (!deviceId) {
            errors.deviceId = "This field is required"
            proceed = false
        }
        if (!imei) {
            errors.imei = "This field is required"
            proceed = false
        }
        if (!mongoose.Types.ObjectId.isValid(assignedUser)) {
            errors.assignedUser = "Invalid User ID"
            proceed = false
        }
        if (!mongoose.Types.ObjectId.isValid(purchaser)) {
            errors.purchaser = "Invalid User ID"
            proceed = false
        }
        if (!proceed) {
            return res.status(200).json({
                success: false,
                message: "All fields are required",
                errors
            });
        }

        
        const purchaserUser = await User.findOne({ _id: purchaser });
        if (!purchaserUser) {
            errors.purchaser = "The entered id doesn't belongs to any user in User Database"
            return res.status(200).json({
                success: false,
                errors
            });
        }

        const assignedUserInDb = await User.findOne({ _id: assignedUser });
        if (!assignedUserInDb) {
            errors.assignedUser = "The entered id doesn't belongs to any user in User Database"
            return res.status(200).json({
                success: false,
                errors
            });
        }
        const deviceFetch = await Device.findOne({
                serialNumber: serialNumber
            })
                .populate("assignedUser", "name email phone profilePicture location")
                .populate("purchaser", "name email phone profilePicture");
        deviceFetch.imei=imei 
        deviceFetch.model=model
        deviceFetch.firmwareVersion=firmwareVersion
        deviceFetch.assignedUser=assignedUser
        deviceFetch.purchaser=purchaser
        deviceFetch.notes=notes
        await deviceFetch.save()
        return res.status(200).json({
            success: true,
            device: getParsedDeviceForAdmin(deviceFetch)
        })



    } catch (Err) {
        console.log(Err)
    }
    return res.status(400).json({
        success: false,
    })

});

router.delete(
    "/user/:id",
    async (req, res) => {

        await User.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
        });
    }
);

router.delete(
    "/devices/:id",
    async (req, res) => {
        console.log("really")
        await Device.findByIdAndDelete(
            req.params.id
        );

        res.status(200).json({
            success: true,
        });
    }
);
router.post(
    "/AdminPermission",
    async (req, res) => {
        if (req.user) {
            if (req.dbUser.adminAccess) {
                return res.status(200).json({
                    authenticated: true,
                    message: "Logged In",
                });
            }
        }

        return res.status(200).json({
            authenticated: false,
            message: "Logged Out",
        });
    }
);




router.post(
    "/device/:serialNumber",
    async (req, res) => {

        try {

            const deviceFetch = await Device.findOne({
                serialNumber: req.params.serialNumber
            })
                .populate("assignedUser", "name email phone profilePicture location")
                .populate("purchaser", "name email phone profilePicture");



            if (!deviceFetch) {
                console.log("Errror")
                return res.status(404).json({
                    success: false,
                    message: "Device not found"
                });
            }
            let asignedPhoto = ''

            if (deviceFetch.assignedUser.profilePicture) {
                asignedPhoto = deviceFetch.assignedUser.profilePicture
                if (!deviceFetch.assignedUser.profilePicture.startsWith("http")) {
                    asignedPhoto = process.env.BACKEND_HOST + deviceFetch.assignedUser.profilePicture
                }
            }
            let parchaserPhoto = ''
            if (deviceFetch.assignedUser.profilePicture) {
                parchaserPhoto = deviceFetch.assignedUser.profilePicture
                if (!deviceFetch.assignedUser.profilePicture.startsWith("http")) {
                    parchaserPhoto = process.env.BACKEND_HOST + deviceFetch.assignedUser.profilePicture
                }
            }
            let lastLocation = {}
            if (!deviceFetch.lastLocation || !deviceFetch.lastLocation.latitude) {
                lastLocation = {
                    latitude: deviceFetch.assignedUser.location.lat,
                    longitude: deviceFetch.assignedUser.location.lng,
                    accuracy: 95,
                    address: "Earth",
                    updatedAt: Date.now(),
                }
            }
            res.status(200).json({
                success: true,
                device: getParsedDeviceForAdmin(deviceFetch)
            });

        } catch (err) {
            console.log(err)
            res.status(500).json({
                success: false,
                message: err.message
            });

        }

    }
);
module.exports = router;