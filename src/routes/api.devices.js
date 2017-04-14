const express = require('express');
const router = express.Router();
const Device = require("../bin/models/device");

function xfilters(field, values) {
    let temp = {};
    if (typeof values == "string") {
        temp[field] = values;
        return temp;
    }
    else if (typeof values == "object") {
        let qstring = { $or: [] };
        values.forEach(function (value) {
            var test = {};
            test[field] = values;
            qstring.$or.push(test)
        })
        return qstring;
    }
}

router.get("/", function (req, res, next) {
    let filters;
    if (req.query.search)
        Device.find({ $or: [{ serialNumber: { "$regex": req.query.search } }, { macAddress: { "$regex": req.query.search, "$options": "i" } }] }, function (err, devices) {
            if (err) res.status(500).json(err);
            else res.json(devices);
        });
    else {
        if (req.query.id) filters = xfilters('_id', req.query.id);
        if (req.query.ownerId) filters = xfilters('ownerId', req.query.ownerId);
        if (req.query.hardwareId) filters = xfilters('hardwareId', req.query.hardwareId);
        if (req.query.serialNumber) filters = xfilters('serialNumber', req.query.serialNumber);
        if (req.query.macAddress) filters = xfilters('macAddress', req.query.macAddress);


        Device.loadLoandId(filters, function (err, devices) {
            if (err) res.status(500).json(err);
            else {
                if (req.query.loanId) {
                    const result = [];
                    devices.forEach(function (device) {
                        if (device.loanId == req.query.loanId) result.push(device);
                    })
                    res.json(result);
                }
                else res.json(devices);
            }
        })
    }

});
router.get("/:serialNumber", function (req, res, next) {
    Device.loadLoandId({ serialNumber: req.params.serialNumber }, function (err, devices) {
        if (err) res.status(500).json(err);
        else res.json(devices[0]);
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
                device.ownerId = req.body.device.ownerId;
                device.hardwareId = req.body.device.hardwareId;
                device.serialNumber = req.body.device.serialNumber;
                device.macAddress = req.body.device.macAddress;
                device.entryDate = req.body.device.entryDate;
                device.origin = req.body.device.origin;
                device.order = req.body.device.order;
                device.replacingDeviceId = req.body.device.replacingDeviceId;
                device.comment = req.body.device.comment;
                device.lost = req.body.device.lost;
                device.removed = req.body.device.removed;
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
    Device.findById(req.params.device_id, function (err, device) {
        if (err) res.status(500).json(err);
        else {
            device.removed = true;
            device.save(function (err, result) {
                if (err) res.status(500).json(err);
                else res.json(device.result);
            })
        }
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