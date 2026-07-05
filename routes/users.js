const express = require("express");
const User = require("../db/user.js");
const EmergencyContact = require("../db/contacts.js");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { ParseUser } = require("../parsers/user")
const { ParseContacts, parseContact } = require("../parsers/contacts")


router.post("/users", async (req, res) => {
    try {
        if (req.dbUser) {
            const users = [];
            const dbusers = await User.find()
                ;

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
                    name: user.name,
                    email: user.email,
                    authProvider: user.authProvider,
                    profilePicture: pp,
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



router.post(
    "/emergency-contact",
    async (req, res) => {
        try {
            if (!req.dbUser) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const {
                name,
                phone,
                relationship,
                email,
                isPrimary,
                receiveSMS,
                receiveCall,
                receivePushNotification,
            } = req.body;

            const errors = {};

            let profilePicture = ''
            if (req.files || req.file) {
                const file = req.files[0]
                const oldPath = file.path;
                const newPath = path.join(
                    __dirname,
                    `../public/contacts/${req.dbUser._id}`,
                    file.filename
                );
                const dir =
                    path.join(__dirname, `../public/contacts/${req.dbUser._id}`);

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.renameSync(oldPath, newPath);
                profilePicture =
                    `/contacts/${req.dbUser._id}/${file.filename}`


            }
            const removeIfPicture = async() => {
                if (profilePicture) {
                    try {

                        const filePath = path.join(
                            __dirname,
                            `../public`,
                            profilePicture
                        )
                        await fs.promises.unlink(filePath);
                    } catch (err) {

                    }
                }
            }
            // Validation
            if (!name?.trim()) {
                errors.name =
                    "Name is required";
            }

            if (!phone?.trim()) {
                errors.phone =
                    "Phone number is required";
            }

            if (
                email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    email
                )
            ) {
                errors.email =
                    "Invalid email address";
            }

            if (
                Object.keys(errors).length > 0
            ) {
                await removeIfPicture()
                return res.status(400).json({
                    success: false,
                    errors,
                });
            }

            // Check duplicate contact
            const existingContact =
                await EmergencyContact.findOne({
                    userId: req.dbUser._id,
                    phone,
                });

            if (existingContact) {
                await removeIfPicture()
                return res.status(400).json({
                    success: false,
                    errors: {
                        phone:
                            "This contact already exists",
                    },
                });
            }

            // Only one primary contact
            if (
                isPrimary === true ||
                isPrimary === "true"
            ) {
                await EmergencyContact.updateMany(
                    {
                        userId: req.dbUser._id,
                    },
                    {
                        isPrimary: false,
                    }
                );
            }

            const emergencyContact =
                await EmergencyContact.create({
                    userId: req.dbUser._id,

                    name: name.trim(),

                    phone: phone.trim(),

                    profilePicture,

                    relationship:
                        relationship ||
                        "Other",

                    email:
                        email?.trim() || "",


                    isPrimary:
                        isPrimary === true ||
                        isPrimary === "true",

                    receiveSMS:
                        receiveSMS === undefined
                            ? true
                            : receiveSMS === true ||
                            receiveSMS ===
                            "true",

                    receiveCall:
                        receiveCall === undefined
                            ? true
                            : receiveCall === true ||
                            receiveCall ===
                            "true",

                    receivePushNotification:
                        receivePushNotification ===
                            undefined
                            ? true
                            : receivePushNotification ===
                            true ||
                            receivePushNotification ===
                            "true",
                });

            return res.status(200).json({
                success: true,
                message:
                    "Emergency contact created successfully",
                contact: parseContact(emergencyContact),
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to create emergency contact",
            });
        }
    }
);
router.put(
    "/emergency-contact",
    async (req, res) => {
        try {
            if (!req.dbUser) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const {
                contactId,
                name,
                phone,
                relationship,
                email,
                isPrimary,
                receiveSMS,
                receiveCall,
                receivePushNotification,
            } = req.body;

            const errors = {};

            let profilePicture = ''
            if (req.files || req.file) {
                const file = req.files[0]
                const oldPath = file.path;
                const newPath = path.join(
                    __dirname,
                    `../public/contacts/${req.dbUser._id}`,
                    file.filename
                );
                const dir =
                    path.join(__dirname, `../public/contacts/${req.dbUser._id}`);

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.renameSync(oldPath, newPath);
                profilePicture =
                    `/contacts/${req.dbUser._id}/${file.filename}`


            }
            const removeIfPicture = async() => {
                if (profilePicture) {
                    try {

                        const filePath = path.join(
                            __dirname,
                            `../public`,
                            profilePicture
                        )
                        await fs.promises.unlink(filePath);
                    } catch (err) {

                    }
                }
            }
            // Validation
            if (!name?.trim()) {
                errors.name =
                    "Name is required";
            }

            if (!phone?.trim()) {
                errors.phone =
                    "Phone number is required";
            }

            if (
                email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    email
                )
            ) {
                errors.email =
                    "Invalid email address";
            }

            if (
                Object.keys(errors).length > 0
            ) {
                await removeIfPicture()

                return res.status(400).json({
                    success: false,
                    errors,
                });
            }

            // Check duplicate contact
            const existingContact =
                await EmergencyContact.findOne({
                    userId: req.dbUser._id,
                    phone,
                });
            if (existingContact && existingContact._id != contactId) {
                await removeIfPicture()
                return res.status(400).json({
                    success: false,
                    errors: {
                        phone:
                            "This contact already exists",
                    },
                });
            }

            // Only one primary contact


            const emergencyContact =
                await EmergencyContact.findOne({
                    _id: contactId,

                });
            try {
                const filePath = path.join(
                    __dirname,
                    `../public`,
                    emergencyContact.profilePicture
                )
                await fs.promises.unlink(filePath);
            } catch (err) {

            }
            emergencyContact.name = name.trim()
            emergencyContact.phone = phone.trim()
            emergencyContact.profilePicture = profilePicture
            emergencyContact.email = email?.trim() || ""
            emergencyContact.relationship = relationship ||
                "Other"
            emergencyContact.isPrimary =
                isPrimary === true ||
                isPrimary === "true"
            emergencyContact.receiveSMS =
                receiveSMS === undefined
                    ? true
                    : receiveSMS === true ||
                    receiveSMS ===
                    "true"
            emergencyContact.receivePushNotification =
                receivePushNotification ===
                    undefined
                    ? true
                    : receivePushNotification ===
                    true ||
                    receivePushNotification ===
                    "true"
            emergencyContact.receiveCall =
                receiveCall === undefined
                    ? true
                    : receiveCall === true ||
                    receiveCall ===
                    "true"
            await emergencyContact.save()
            return res.status(200).json({
                success: true,
                message:
                    "Emergency contact created successfully",
                contact: parseContact(emergencyContact),
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to create emergency contact",
            });
        }
    }
);

router.post("/emergency-contacts", async (req, res) => {
    try {
        if (!req.dbUser) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }


        const contacts = await EmergencyContact
            .find({
                userId: req.dbUser._id,
            })
            .sort({
                isPrimary: -1,
                createdAt: -1,
            });

        return res.status(200).json({
            success: true,
            contacts: ParseContacts(contacts),
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to create emergency contact",
        });
    }
})

module.exports = router;