const express = require('express');
const router = express.Router();
const Device = require("../bin/models/device");

function xfilters(filters, field, values) {
    let temp = {};
    if (typeof values == "string") {
        if (field == "returned" || field == "lost") {
            if (values == true)  filters[field] = true;
            else  filters[field] = { $ne: true };
            //return temp;
        } else {
            //temp[field] = values;
             filters[field] = values;
        }
    }
    else if (typeof values == "object") {
        let qstring = [];
        values.forEach(function (value) {
            var test = {};
            test[field] = value;
            qstring.push(test)
        });
        filters["$or"] = qstring;    
    }
    return filters
}

router.get("/", function (req, res, next) {
    let filters = {};
    if (req.query.search)
        Device.find({ removed: { $ne: true }, $or: [{ serialNumber: { "$regex": req.query.search } }, { macAddress: { "$regex": req.query.search, "$options": "i" } }] }, function (err, devices) {
            if (err) res.status(500).json(err);
            else res.json(devices);
        });
    else {
        if (req.query.id != undefined) filters = xfilters(filters, '_id', req.query.id);
        if (req.query.ownerId != undefined) filters = xfilters(filters, 'ownerId', req.query.ownerId);
        if (req.query.hardwareId != undefined) filters = xfilters(filters, 'hardwareId', req.query.hardwareId);
        if (req.query.serialNumber != undefined) filters = xfilters(filters, 'serialNumber', req.query.serialNumber);
        if (req.query.macAddress != undefined) filters = xfilters(filters, 'macAddress', req.query.macAddress);
        if (req.query.returned != undefined) filters = xfilters(filters, 'returned', req.query.returned);
        if (req.query.lost != undefined) filters = xfilters(filters, 'lost', req.query.lost);
        filters.removed = { $ne: true };
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
            if (err && err.message.indexOf("serialNumber_1 dup key:") > 0) {
                Device.findOne({ serialNumber: req.body.device.serialNumber }, function (err, device) {
                    if (err) res.status(500).json(err);
                    else {
                        device.ownerId = req.body.device.ownerId;
                        device.hardwareId = req.body.device.hardwareId;
                        device.macAddress = req.body.device.macAddress;
                        device.entryDate = req.body.device.entryDate;
                        device.origin = req.body.device.origin;
                        device.order = req.body.device.order;
                        device.returned = req.body.device.returned;
                        device.lost = req.body.device.lost;
                        device.removed = req.body.device.removed;
                        device.edited_by = req.session.passport.user.id;
                        device.save(function (err, dev) {
                            if (err) res.status(500).json(err);
                            else res.json(dev);
                        })
                    }
                })
            } else if (err) res.status(500).json(err);
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
                device.returned = req.body.device.returned;
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
router.post("/:device_id/comment", function (req, res, next) {
    if (req.body.comment) {
        Device.findById(req.params.device_id).exec(function (err, device) {
            const newComment = {
                created_by: req.session.passport.user.id,
                created_at: new Date(),
                comment: req.body.comment
            };
            device.comments.push(newComment);
            device.edited_by = req.session.passport.user.id;
            device.save(function (err, result) {
                if (err) res.status(500).json(err);
                else res.json(result);
            })
        })
    } else res.status(400).json({ error: "missing parametesr" });
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
    if (req.query['modelId']) {
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