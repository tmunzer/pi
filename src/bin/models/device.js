var mongoose = require('mongoose');
var Hardware = require("./hardware");
var User = require("./user");

var DeviceSchema = new mongoose.Schema({
    ownerId: { type: mongoose.Schema.ObjectId, ref: "User" },
    hardwareId: { type: mongoose.Schema.ObjectId, ref: "Hardware", required: true },
    serialNumber: { type: String, unique: true, required: true },
    macAddress: String,
    entryDate: Date,
    origin: String,
    order: String,
    lost: Boolean,
    replacingDeviceId: { type: mongoose.Schema.ObjectId, ref: "Device" },
    comment: String,
    created_by: {type: mongoose.Schema.ObjectId, required: true, ref: "User"},
    edited_by: {type: mongoose.Schema.ObjectId, required: true, ref: "User"},
    created_at: { type: Date },
    updated_at: { type: Date }
});

// Pre save
DeviceSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Device = mongoose.model('Device', DeviceSchema);
module.exports = Device;
