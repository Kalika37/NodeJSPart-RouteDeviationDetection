const jwt = require("jsonwebtoken");

function generateAccessToken(user) {
    return jwt.sign(
        {
            uid: user.uid,
            email: user.email,
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
        }
    );
}

function generateRefreshToken(user) {
    return jwt.sign(
        {
            uid: user.uid,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES || "30d",
        }
    );
}

module.exports = {
    generateAccessToken,
    generateRefreshToken,
};