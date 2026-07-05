const express = require("express");
const Device = require("../db/deviceinfo.js");
const User = require("../db/user.js");
const EmergencyContact = require("../db/contacts.js");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const {getParsedDevice} = require("../parsers/parseDevice.js")

router.post("/devices", async (req, res) => {
    try {
        if (req.dbUser) {
            const devices = await Device.find({ purchaser: req.dbUser._id })
            return res.json({
                success: true,
                devices,
            });
        }
    } catch (Err) {
        console.log(Error)
    }
    return res.status(400).json({
        success: false,
    })

});



router.put(
    "/device/:serialNumber",
    async (req, res) => {

        try {


            const device = await Device.findOne({
                serialNumber:
                    req.params.serialNumber,
            });
            if (req.body?.assignedUser) {
                device.assignedUser =
                    req.body.assignedUser;

                await device.save();


            }
            if (req.files || req.file) {
                
                const file=req.files[0]
                const oldPath = file.path;
                const newPath = path.join(
                    __dirname,
                    `../public/devices/${device.serialNumber}`,
                    file.filename
                );
                const dir =
                    path.join(__dirname, `../public/devices/${device.serialNumber}`);

                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }
                fs.renameSync(oldPath, newPath);
                const profilePicture =
                    `/devices/${device.serialNumber}/${file.filename}`

                const pathtodelete = path.join(
                    __dirname,
                    `../public${device.lastPhoto.imageUrl}`);
                try{
                    await fs.promises.unlink(pathtodelete);
                }catch(err){
                    console.log(err,pathtodelete)
                }
                device.lastPhoto={
                    capturedAt:new Date(),
                    imageUrl:profilePicture
                } 
                await device.save()
            }
            const deviceFetch = await device.populate([
                {
                    path: "assignedUser",
                    select: "_id name email phone profilePicture location",
                },
                {
                    path: "purchaser",
                    select: "_id name email phone profilePicture",
                },
            ]);
            const dv = await getParsedDevice(deviceFetch)
            res.status(200).json({
                success: true,
                device: dv
            });
        } catch (err) {
            console.log(err)
        }
    }
)

router.post(
    "/device/:serialNumber",
    async (req, res) => {

        try {

            const deviceFetch = await Device.findOne({
                serialNumber: req.params.serialNumber
            })
                .populate("assignedUser", "_id name email phone profilePicture location")
                .populate("purchaser", "_id name email phone profilePicture");



            if (!deviceFetch) {
                console.log("Errror")
                return res.status(404).json({
                    success: false,
                    message: "Device not found"
                });
            }
            const device = await getParsedDevice(deviceFetch)
            res.status(200).json({
                success: true,
                device
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