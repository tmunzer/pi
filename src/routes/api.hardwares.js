var express = require('express');
var router = express.Router();
var Hardware = require("../bin/models/hardware");
var Device = require("../bin/models/device");
var Loan = require(appRoot + "/bin/models/Loan");

function checkDeviceStatus(devices, cb) {
    let lost = 0;
    let out = 0;
    Loan
        .find({ 'endDate': null })
        .exec(function (err, loans) {
            console.log(loans);
            if (err) res.status(500).json(err);
            else
                devices.forEach(function (device) {
                    if (device.lost) lost++;
                    else loans.forEach(function (loan) {
                        if (loan.deviceId.indexOf(device._id) >= 0) out++;
                    })
                })
            cb({ lost: lost, out: out });
        })
}


function countDevices(hardwares, cb) {
    done = 0;
    let result = JSON.parse(JSON.stringify(hardwares));
    result.forEach(function (hardware) {
        Device
            .find({ hardwareId: hardware._id })
            .exec(function (err, res) {
                if (err) {
                    hardware.numberOfDevices = 'n/a';
                    done++;
                    if (done == hardwares.length) cb(result);
                } else {
                    hardware.numberOfDevices = res.length;
                    checkDeviceStatus(res, function (status) {
                        hardware.out = status.out;
                        hardware.lost = status.lost;
                        done++;
                        if (done == hardwares.length) cb(result);
                    })
                }
            })
    })
}


router.get("/", function (req, res, next) {
    if (req.query.hasOwnProperty('type')) {
        Hardware.findByType(req.query.type, function (err, hardwares) {
            if (err) res.status(500).json(err);
            else countDevices(hardwares, function (result) {
                res.json(result);
            });
        })
    } else {
        Hardware
            .find({})
            .sort({ 'model': 'asc' })
            .populate("created_by")
            .populate("edited_by")
            .exec(function (err, hardwares) {
                if (err) res.status(500).json(err);
                else countDevices(hardwares, function (result) {
                    res.json(result);
                });
            })
    }
});
router.get("/:model", function (req, res, next) {
    Hardware
        .findOne({ model: req.params.model })
        .populate("created_by")
        .populate("edited_by")
        .exec(function (err, hardware) {
            if (err) res.status(500).json(err);
            else res.json(hardware);
        })
})

router.post("/", function (req, res, next) {
    if (req.body.hardware) {
        const hardware = req.body.hardware;
        hardware.created_by = req.session.passport.user.id;
        hardware.edited_by = req.session.passport.user.id;
        Hardware(hardware).save(function (err, hardware) {
            if (err) res.status(500).json(err);
            else res.json(hardware);
        });
    } else res.status(400).json({ error: "missing parametesr" });
});
router.post("/:hardware_id", function (req, res, next) {
    if (req.body.hardware)
        Hardware.findById(req.params.hardware_id, function (err, hardware) {
            if (err) res.status(500).json(err);
            else {
                hardware.type = req.body.hardware.type;
                hardware.model = req.body.hardware.model;
                hardware.serialFormat = req.body.hardware.serialFormat;
                hardware.edited_by = req.session.passport.user.id;
                hardware.save(function (err, result) {
                    res.json(result);
                });
            }
        });
    else res.status(400).json({ error: "missing parametesr" });
});


router.delete("/:hardware_id", function (req, res, next) {
    Hardware.remove({ "_id": req.params.hardware_id }, function (err, hardware) {
        if (err) res.status(500).json(err);
        else res.json(hardware.result);
    })
});


module.exports = router;