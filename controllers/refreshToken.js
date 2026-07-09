const jwt = require("jsonwebtoken");
const User = require("../db/User");
const { generateAccessToken } = require("../utils/tokens");

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            message: "Refresh token is required.",
        });
    }

    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid refresh token.",
            });
        }

        const newAccessToken = generateAccessToken(user);

        res.json({
            success: true,
            accessToken: newAccessToken,
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Refresh token expired or invalid.",
        });
    }
};

module.exports = { refreshToken };