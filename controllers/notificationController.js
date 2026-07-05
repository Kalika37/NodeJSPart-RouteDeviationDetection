const admin = require('../config/firebase');

exports.sendNotification = async (req, res) => {
    const { token, title, body } = req.body;
    try {

        await admin.messaging().send({
            token,
            notification: {
                title,
                body
            }
        });
        res.json({
            success: true,
            message: 'Notification sent'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};