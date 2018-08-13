var mongoose = require('mongoose');

function upperCase(val) {
    if (typeof val !== 'string') val = '';
    return val.toUpperCase();
}

var HardwareSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true,
        unique: true,
        set: upperCase
    },
    serialFormat: {
        type: String,
        required: true
    },
    created_by: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    edited_by: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: "User"
    },
    created_at: {
        type: Date
    },
    updated_at: {
        type: Date
    }
});


// Pre save
HardwareSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Hardware = mongoose.model('Hardware', HardwareSchema);
Hardware.loadWithDevicesNumber = function (filters, cb) {
    const Device = require("./device");
    let done = 0;
    this.find(filters)
        .sort({
            'model': 'asc'
        })
        .populate("created_by")
        .populate("edited_by")
        .exec(function (err, hardwares) {
            if (err) cb(err);
            else if (hardwares && hardwares.length > 0) {
                hardwares = JSON.parse(JSON.stringify(hardwares));
                hardwares.forEach(function (hardware) {
                    Device.countStatus({
                        hardwareId: hardware._id
                    }, function (count) {
                        hardware.count = count;
                        done++;
                        if (done == hardwares.length) cb(null, hardwares);
                    });
                });
            } else cb(null, []);
        });
};
Hardware.findByType = function (type, callback) {
    this.find({
        type: type
    }, callback);
};
Hardware.findByDevice = function (device, callback) {
    this.find({
        device: device
    }, callback);
};
module.exports = Hardware;