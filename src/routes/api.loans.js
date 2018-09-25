const express = require('express');
const router = express.Router();
const Device = require("../bin/models/device");
const Loan = require("../bin/models/loan");



router.get("/", function (req, res, next) {
    const filters = {};

    if (req.query.id) filters._id = req.query.id;
    if (req.query.ownerId) filters.ownerId = req.query.ownerId;
    if (req.query.deviceId) filters.deviceId = req.query.deviceId;
    if (req.query.companyId) filters.companyId = req.query.companyId;
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
                const newComment = {
                    created_by: req.session.passport.user.id,
                    created_at: new Date(),
                    comment: req.body.comment
                };
                loan.comments.push(newComment);
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
                loan.aborted = req.body.loan.aborted;
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



module.exports = router;