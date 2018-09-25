const express = require('express');
const router = express.Router();
var format = require('date-format');

const Loan = require("../bin/models/loan");
const Device = require("../bin/models/device");


function getDeviceList(loan, req, res) {
    var devices = [];
    for (i = 0; i < loan.deviceId.length; i++) {
        Device.findById(loan.deviceId[i])
            .populate("hardwareId")
            .exec(function (err, dev) {
                devices.push(dev);
                if (loan.deviceId.length == devices.length) {
                    devices = devices.sort(function (a, b) {
                        console.log(a.serialNumber, b.serialNumber, a.serialNumber - b.serialNumber)
                        return a.serialNumber - b.serialNumber;
                    });
                    const endDate = format('dd/MM/yyyy', new Date(loan.estimatedEndDate));
                    res.render('preview', {
                        title: 'Prêt Aerohive',
                        loan: loan,
                        endDate: endDate,
                        devices: devices
                    });
                }
            })
    }
}

/* GET home page. */
router.get('/:loan_id', function (req, res, next) {
    Loan.findById(req.params.loan_id)
        .populate("ownerId")
        .populate("companyId")
        .populate("contactId")
        .exec(function (err, loan) {
            if (err) res.render("error", { error: err })
            else {
                getDeviceList(loan, req, res);
            }
        });
});
router.get('/', function (req, res, next) {
    res.render('preview', {
        title: 'Prêt Aerohive',
        loan: null
    });
});

module.exports = router;
