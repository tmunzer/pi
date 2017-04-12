var express = require('express');
var router = express.Router();
var Device = require("../bin/models/device");
var Loan = require("../bin/models/loan");



router.get("/", function (req, res, next) {
    var filters = {};
    if (req.query.ownerId) filters.ownersId = req.query.ownerId;
    if (req.query.hardwareId) filters.hardwareId = req.query.hardwareId;
    if (req.query.serialNumber) filters.serialNumber = req.query.serialNumber;
    if (req.query.macAddress) filters.macAddress = req.query.macAddress;

    Loan
        .find(filters)
        .populate("deviceId")
        .populate("ownerId")
        .populate("companyId")
        .populate("contactId")
        .populate("created_by")
        .populate("edited_by")
        .sort("startDate")
        .exec(function (err, loans) {
            if (err) res.status(500).json(err);
            else res.json(loans);
        })

});
router.get("/:loan_id", function (req, res, next) {
    Loan.findById(req.params.loan_id)
        .populate("deviceId")
        .populate("ownerId")
        .populate("companyId")
        .populate("contactId")
        .populate("created_by")
        .populate("edited_by")
        .exec(function (err, loan) {
            if (err) res.status(500).json(err);
            else res.json(loan);
        })
})
router.post("/", function (req, res, next) {
    if (req.body.loan) {
        const loan = req.body.loan;
        loan.created_by = req.session.passport.user.id;
        loan.edited_by = req.session.passport.user.id;
        Loan(loan).save(function (err, loan) {
            if (err) res.status(500).json(err);
            else res.json(loan);
        });
    } else res.status(400).json({ error: "missing parametesr" });
});
router.post("/:loan_id/comment", function (req, res, next) {
    if (req.body.comment)
        Loan.findById(req.params.loan_id, function (err, loan) {
            if (err) res.status(500).json(err);
            else {
                loan.comment.push(comment);
                loan.edited_by = req.session.passport.user.id;
                loan.save(function (err, result) {
                    if (err) res.status(500).json(err);
                    else res.json(result);
                });
            }
        })
    else res.status(400).json({ error: "missing parametesr" });
})
router.post("/:loan_id", function (req, res, next) {
    if (req.body.loan)
        Loan.findById(req.params.loan_id, function (err, loan) {
            if (err) res.status(500).json(err);
            else {
                loan.deviceId = req.body.loan.deviceId;
                loan.contactId = req.body.loan.contactId;
                loan.companyId = req.body.loan.companyId;
                loan.poe = req.body.loan.poe;
                loan.other = req.body.loan.other;
                loan.companyId = req.body.loan.companyId;
                loan.ownerId = req.body.loan.ownerId;
                loan.startDate = req.body.loan.startDate;
                loan.estimatedEndDate = req.body.loan.estimatedEndDate;
                loan.endDate = req.body.loan.endDate;
                loan.edited_by = req.session.passport.user.id;
                loan.save(function (err, result) {
                    if (err) res.status(500).json(err);
                    else res.json(result);
                });
            }
        });
    else res.status(400).json({ error: "missing parametesr" });
});

router.delete("/:loan_id", function (req, res, next) {
    Loan.remove({ "_id": req.params.loan_id }, function (err, loan) {
        if (err) res.status(500).json(err);
        else res.json(loan.result);
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