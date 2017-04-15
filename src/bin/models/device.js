const mongoose = require('mongoose');
const Hardware = require("./hardware");
const User = require("./user");

const DeviceSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.ObjectId, ref: "User" },
    hardwareId: { type: mongoose.Schema.ObjectId, ref: "Hardware", required: true },
    serialNumber: { type: String, unique: true, required: true },
    macAddress: String,
    entryDate: Date,
    origin: String,
    order: String,
    lost: Boolean,
    removed: Boolean,
    replacingDeviceId: { type: mongoose.Schema.ObjectId, ref: "Device" },
    comments: [{
        created_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
        created_at: { type: Date, required: true, default: new Date() },
        comment: { type: String, required: true }
    }],
    created_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    edited_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    created_at: { type: Date },
    updated_at: { type: Date }
});

// Pre save
DeviceSchema.pre('save', function (next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const Device = mongoose.model('Device', DeviceSchema);

Device.loadLoandId = function (filters, cb) {
    const Loan = require("./loan");
    let results = [];
    if (!filters) filters = { removed: { $ne: true } };
    this.find(filters)
        .populate("hardwareId")
        .populate("ownerId")
        .populate("companyId")
        .populate("contactId")
        .populate("created_by")
        .populate("edited_by")
        .populate("comments.created_by")
        .sort("serialNumber")
        .exec(function (err, devices) {
            if (err) cb(err);
            else {
                devices = JSON.parse(JSON.stringify(devices));
                Loan
                    .find({ 'endDate': null, aborted: { $ne: true } })
                    .exec(function (err, loans) {
                        if (err) cb(err);
                        else
                            devices.forEach(function (device) {
                                loans.forEach(function (loan) {
                                    if (loan.deviceId.indexOf(device._id) >= 0) device.loanId = loan._id;
                                })
                            })
                        cb(null, devices);
                    })
            }
        })

}
function countDeviceStatus(devices, cb) {
    const Loan = require("./loan");
    let lost = 0;
    let out = 0;
    Loan
        .find({ 'endDate': null, aborted: { $ne: true } })
        .exec(function (err, loans) {
            if (err) {
                lost = "error";
                out = "error";
            }
            else
                devices.forEach(function (device) {
                    if (device.lost) lost++;
                    else
                        loans.forEach(function (loan) {
                            if (loan.deviceId.indexOf(device._id) >= 0) out++;
                        })
                })
            cb(out, lost);
        })
}

Device.countStatus = function (filters, cb) {
    const count = {};
    filters.removed = { $ne: true };
    Device.find(filters)
        .exec(function (err, devices) {
            if (err) {
                count.total = 'error';
                count.out = 'error';
                count.lost = 'error';
            } else {
                count.total = devices.length;
                countDeviceStatus(devices, function (out, lost) {
                    count.out = out;
                    count.lost = lost;
                    cb(count);
                })
            }
        })
}
module.exports = Device;
