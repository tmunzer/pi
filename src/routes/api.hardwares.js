const express = require('express');
const router = express.Router();
const Hardware = require("../bin/models/hardware");
const Device = require("../bin/models/device");
const Loan = require("../bin/models/loan");


router.get("/", function (req, res, next) {
    const filters = {};
    if (req.query.search != undefined)
        Hardware.find({
            $or: [{
                model: {
                    "$regex": req.query.search,
                    "$options": "i"
                }
            }, {
                type: {
                    "$regex": req.query.search,
                    "$options": "i"
                }
            }]
        }, function (err, hardwares) {
            if (err) res.status(500).json(err);
            else res.json(hardwares);
        });
    else {
        if (req.query.id) filters._id = req.query.id;
        if (req.query.type) filters.type = req.query.type;
        Hardware.loadWithDevicesNumber(filters, function (err, hardwares) {
            if (err) res.status(500).json(err);
            else res.json(hardwares);
        });
    }
});

router.get("/:model", function (req, res, next) {
    Hardware
        .findOne({
            model: req.params.model
        })
        .populate("created_by")
        .populate("edited_by")
        .exec(function (err, hardware) {
            if (err) res.status(500).json(err);
            else res.json(hardware);
        });
});
router.post("/", function (req, res, next) {
    if (req.body.hardware) {
        const hardware = req.body.hardware;
        hardware.created_by = req.session.passport.user.id;
        hardware.edited_by = req.session.passport.user.id;
        Hardware(hardware).save(function (err, hardware) {
            if (err) res.status(500).json(err);
            else res.json(hardware);
        });
    } else res.status(400).json({
        error: "missing parametesr"
    });
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
    else res.status(400).json({
        error: "missing parametesr"
    });
});


router.delete("/:hardware_id", function (req, res, next) {
    Hardware.remove({
        "_id": req.params.hardware_id
    }, function (err, hardware) {
        if (err) res.status(500).json(err);
        else res.json(hardware.result);
    });
});


module.exports = router;