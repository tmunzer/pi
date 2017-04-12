var express = require('express');
var router = express.Router();
var Device = require(appRoot + "/bin/models/device");
var Loan = require(appRoot + "/bin/models/Loan");

function checkDeviceStatus(list, res, cb) {
    const devices = JSON.parse(JSON.stringify(list));
    Loan
        .find({ 'endDate': null })
        .exec(function (err, loans) {
            if (err) res.status(500).json(err);
            else
                devices.forEach(function (device) {
                    if (!device.lost)
                        loans.forEach(function (loan) {
                            if (loan.deviceId.indexOf(device._id) >= 0) device.loanId = loan._id;
                        })
                })
            cb(devices);
        })
}


router.get("/", function (req, res, next) {
    var filters = {};
    if (req.query.ownerId) filters.ownersId = req.query.ownerId;
    if (req.query.hardwareId) filters.hardwareId = req.query.hardwareId;

    if (req.query.serialNumber) filters.serialNumber = req.query.serialNumber;
    if (req.query.macAddress) filters.macAddress = req.query.macAddress;

    Device
        .find(filters)
        .populate("hardwareId")
        .populate("ownerId")
        .populate("companyId")
        .populate("contactId")
        .populate("created_by")
        .populate("edited_by")
        .sort("serialNumber")
        .exec(function (err, result) {
            if (err) res.status(500).json(err);
            else checkDeviceStatus(result, res, function (devices) {
                res.json(devices);
            })
        })

});
router.get("/:serialNumber", function (req, res, next) {
    Device.findOne({ serialNumber: req.params.serialNumber })
        .populate("hardwareId")
        .populate("ownerId")
        .populate("companyId")
        .populate("contactId")
        .populate("created_by")
        .populate("edited_by")
        .exec(function (err, result) {
            if (err) res.status(500).json(err);
            else checkDeviceStatus([result], res, function (device) {
                res.json(device[0]);
            })
        })
})
router.post("/", function (req, res, next) {
    if (req.body.device) {
        const device = req.body.device;
        device.created_by = req.session.passport.user.id;
        device.edited_by = req.session.passport.user.id;
        Device(device).save(function (err, device) {
            if (err) res.status(500).json(err);
            else res.json(device);
        });
    } else res.status(400).json({ error: "missing parametesr" });
});
router.post("/:device_id", function (req, res, next) {
    if (req.body.device)
        Device.findById(req.params.device_id, function (err, device) {
            if (err) res.status(500).json(err);
            else {
                if (req.body.device.ownerId) device.ownerId = req.body.device.ownerId;
                if (req.body.device.hardwareId) device.hardwareId = req.body.device.hardwareId;
                if (req.body.device.serialNumber) device.serialNumber = req.body.device.serialNumber;
                if (req.body.device.macAddress) device.macAddress = req.body.device.macAddress;
                if (req.body.device.entryDate) device.entryDate = req.body.device.entryDate;
                if (req.body.device.origin) device.origin = req.body.device.origin;
                if (req.body.device.order) device.order = req.body.device.order;
                if (req.body.device.replacingDeviceId) device.replacingDeviceId = req.body.device.replacingDeviceId;
                if (req.body.device.comment) device.comment = req.body.device.comment;
                if (req.body.device.lost) device.lost = req.body.device.lost;
                device.edited_by = req.session.passport.user.id;
                device.save(function (err, result) {
                    if (err) res.status(500).json(err);
                    else res.json(result);
                });
            }
        });
    else res.status(400).json({ error: "missing parametesr" });
});

router.delete("/:device_id", function (req, res, next) {
    Device.remove({ "_id": req.params.device_id }, function (err, device) {
        if (err) res.status(500).json(err);
        else res.json(device.result);
    })
});
router.get("/replace/", function (req, res, next) {
    if (req.query.hasOwnProperty('modelId')) {
        Device.find({ modelId: req.query.modelId }, function (err, devices) {
            if (err) res.status(500).json(err);
            else {
                var devicesList = [];
                devices.forEach(function (device) {
                    devicesList.push({ id: device._id, serialNumber: device.serialNumber });
                });
                res.json(devicesList);
            }
        })
    }
});


module.exports = router;