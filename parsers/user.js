const ParseUser = (user) => {
    let pp = user.profilePicture
    if (!user?.profilePicture?.startsWith("http") && user && user?.profilePicture) {
        pp = process.env.BACKEND_HOST + user.profilePicture
    }
    let role = "user"
    if (user.adminAccess) {
        role = "Admin"
    }
    return {
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
    }
}



module.exports={ParseUser}