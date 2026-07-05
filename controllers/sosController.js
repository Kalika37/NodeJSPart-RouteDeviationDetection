// const SOS = require('../sosModel');

class SOS{
    createAlert(...arg){

    }
}
const { getIO } = require('../config/socket');

exports.sendSOS = (req, res) => {

    const alert = SOS.createAlert(req.body);

    getIO().emit('sos-notification', alert);

    res.status(201).json({
        success: true,
        alert
    });
};

exports.getAlerts = (req, res) => {

    const alerts = SOS.getAllAlerts();

    res.json(alerts);
};