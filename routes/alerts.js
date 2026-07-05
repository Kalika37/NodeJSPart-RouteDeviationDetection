const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');

const EmergencyContact = require("../db/contacts.js");
const UserCurrentDevice = require("../db/user_current_device.js");
const Notification = require("../db/notifications.js");


router.post('/alert-requested', async (req, res) => {
    try {
        const { senderDeviceID, notificatioin_type, uniqueDeviceWifiAddress } = req.body
        const user_current_device = await UserCurrentDevice.findOne({ device: senderDeviceID }).populate("device").populate("user")
        if (user_current_device.device.macAddress == user_current_device) {
            return res.status(400).json({
                success: false,
                message:
                    "Failed to send notification",
            });
        }
        const contacts = await EmergencyContact
            .find({
                userId: user_current_device.user._id,
            })
            .sort({
                isPrimary: -1,
                createdAt: -1,
            });
        let title, body;
        if (notification_type === 'fall_detected') {
            title = "Fall Detected"
            body = "The system found that the device is fall down"

        } else {
            title = "Route Deviated"
            body = "Your child has done out of track"
        }
        const notification = await Notification.create({
            sender: user_current_device.user._id,
            recipient: user_current_device.user._id,
            recipient: user_current_device.device._id,
            title: title,
            message: body,
            type: notification_type,
            priority: "high",
            actionUrl: ""
        })
        for (let i = 0; i < user_current_device.user.devices.length; i++) {
            const device = user_current_device.user.devices[i]
            sendNotification({
                token: device.fcmToken,
                notification: {
                    title: notification.title,
                    body: notification.message
                }
            })
        }
        return res.status(200).json({
            success: true,
            contacts,
        });


    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message:
                "Failed to create emergency contact",
        });
    }
});
router.get('/create-random', async (req, res) => {
    try {
        if (req.dbUser) {
            return res.status(200).json({
                success: true,
            });

            const notifications = [
                {
                    title: "Route Deviation Detected",
                    body: "Your child has gone out of track",
                    type: 'route_deviated'
                },
                {
                    title: "Fall Detected",
                    body: "Your child is supposed to fall down",
                    type: 'fall_detected'
                },
                {
                    title: "Route Deviation Detected",
                    body: "Your child has gone out of track",
                    type: 'route_deviated'
                }
            ]
            const user_current_device = await UserCurrentDevice.findOne({ user: req.dbUser._id }).populate("device").populate("user")

            for (let i = 0; i < notifications.length; i++) {

                const notif = notifications[i]
                const notification = await Notification.create({
                    sender: user_current_device.user._id,
                    recipient: user_current_device.user._id,
                    device: user_current_device.device._id,
                    title: notif.title,
                    message: notif.body,
                    type: notif.type,
                    priority: "high",
                    actionUrl: ""
                })
            }
            return res.status(200).json({
                success: true,
            });
        }
    } catch (err) {

    }
})
router.post('/notifications', async (req, res) => {
    try {
        if (req.dbUser) {
            const notifications=await Notification.find({
                recipient:req.dbUser._id
            })
            .populate([
                            {
                                path: "recipient",
                                select: "_id name email phone profilePicture location",
                            },
                            {
                                path: "device",
                                select: "_id deviceId serialNumber assignedUser lastLocation",
                            },
                        ])
           

            
            return res.status(200).json({
                success: true,
                notifications
            });
        }
    } catch (err) {
        console.log(err)
    }
    return res.status(200).json({
                success: false,
            });
})
router.post('/notifications/onreadread', async (req, res) => {
    try {
        if (req.dbUser) {
            const notification=await Notification.findOne({
                _id:req.body.notificationId
            })
            notification.isRead=true
            await notification.save()
            return res.status(200).json({
                success: true,
                notification
            });
        }
    } catch (err) {
        console.log(err)
    }
    return res.status(200).json({
                success: false,
            });
})

async function sendNotification(message) {
    await admin.messaging().send(message);
}
module.exports = router;