const EmergencyContact = require("../db/contacts.js");

const getParsedDevice = async (deviceFetch) => {
    let asignedPhoto = ''
    const emergencyContact = await EmergencyContact.findOne({ userId: deviceFetch.assignedUser._id, isPrimary: true })

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
    let profileDevicePicture = ''
    if (deviceFetch?.lastPhoto?.imageUrl) {
        profileDevicePicture = deviceFetch.lastPhoto.imageUrl
        if (!deviceFetch.lastPhoto.imageUrl.startsWith("http")) {
            profileDevicePicture = process.env.BACKEND_HOST + deviceFetch.lastPhoto.imageUrl
        }
    }
    let lastLocation = {}
    if (!deviceFetch.lastLocation || !deviceFetch.lastLocation.latitude) {
        lastLocation = {
            latitude: deviceFetch.assignedUser?.location?.lat,
            longitude: deviceFetch.assignedUser?.location?.lng,
            accuracy: 95,
            address: "Earth",
            updatedAt: Date.now(),
        }
    }
    return {
         id: deviceFetch._id,
        deviceId: deviceFetch.deviceId,
        serialNumber: deviceFetch.serialNumber,
        model: deviceFetch.model,
        firmwareVersion: deviceFetch.firmwareVersion,
        batteryLevel: deviceFetch.batteryLevel,
        emergencyMode: deviceFetch.emergencyMode,
        lastSeen: deviceFetch.lastSeen,
        active: deviceFetch.status === 'active',
        deviceType: deviceFetch.deviceType,
        lastPhoto: deviceFetch.lastPhoto,
        imei: deviceFetch.imei,
        lastSeenAt: deviceFetch.lastSeenAt,
        profilePicture: profileDevicePicture,
        emergencyContact,
        name: deviceFetch.name,
        lastLocation,
        assignedUser: {
            name: deviceFetch.assignedUser.name,
            id: deviceFetch.assignedUser._id,
            email: deviceFetch.assignedUser.email,
            phone: deviceFetch.assignedUser.phone,
            profilePicture: asignedPhoto
        },
        purchaser: {
            name: deviceFetch.purchaser.name,
            id: deviceFetch.purchaser._id,
            email: deviceFetch.purchaser.email,
            phone: deviceFetch.purchaser.phone,
            profilePicture: parchaserPhoto
        }
    }
}
const getParsedDeviceForAdmin = (deviceFetch) => {
    let asignedPhoto = ''

    if (deviceFetch.assignedUser.profilePicture) {
        asignedPhoto = deviceFetch.assignedUser.profilePicture
        if (!deviceFetch.assignedUser.profilePicture.startsWith("http")) {
            asignedPhoto = process.env.BACKEND_HOST + deviceFetch.assignedUser.profilePicture
        }
    }
    let parchaserPhoto = ''
    if (deviceFetch.assignedUser?.profilePicture) {
        parchaserPhoto = deviceFetch.assignedUser.profilePicture
        if (!deviceFetch.assignedUser.profilePicture.startsWith("http")) {
            parchaserPhoto = process.env.BACKEND_HOST + deviceFetch.assignedUser.profilePicture
        }
    }
    let profileDevicePicture = ''
    if (deviceFetch?.lastPhoto?.imageUrl) {
        profileDevicePicture = deviceFetch.lastPhoto.imageUrl
        if (!deviceFetch.lastPhoto.imageUrl.startsWith("http")) {
            profileDevicePicture = process.env.BACKEND_HOST + deviceFetch.lastPhoto.imageUrl
        }
    }
    let lastLocation = {}
    if (!deviceFetch.lastLocation || !deviceFetch.lastLocation.latitude) {
        lastLocation = {
            latitude: deviceFetch.assignedUser?.location?.lat,
            longitude: deviceFetch.assignedUser?.location?.lng,
            accuracy: 95,
            address: "Earth",
            updatedAt: Date.now(),
        }
    }
    return {
        id: deviceFetch._id,
        deviceId: deviceFetch.deviceId,
        serialNumber: deviceFetch.serialNumber,
        model: deviceFetch.model,
        firmwareVersion: deviceFetch.firmwareVersion,
        batteryLevel: deviceFetch.batteryLevel,
        emergencyMode: deviceFetch.emergencyMode,
        lastSeen: deviceFetch.lastSeen,
        active: deviceFetch.status === 'active',
        deviceType: deviceFetch.deviceType,
        lastPhoto: deviceFetch.lastPhoto,
        imei: deviceFetch.imei,
        lastSeenAt: deviceFetch.lastSeenAt,
        profilePicture: profileDevicePicture,
        name: deviceFetch.name,
        lastLocation,
        assignedUser: {
            name: deviceFetch.assignedUser.name,
            id: deviceFetch.assignedUser._id,
            email: deviceFetch.assignedUser.email,
            phone: deviceFetch.assignedUser.phone,
            profilePicture: asignedPhoto
        },
        purchaser: {
            name: deviceFetch.purchaser.name,
            id: deviceFetch.purchaser._id,
            email: deviceFetch.purchaser.email,
            phone: deviceFetch.purchaser.phone,
            profilePicture: parchaserPhoto
        }
    }
}

module.exports={getParsedDevice,getParsedDeviceForAdmin}