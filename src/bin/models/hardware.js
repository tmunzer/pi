var mongoose = require('mongoose');

function upperCase (val){
    if (typeof val !== 'string') val = '';
    return val.toUpperCase();
}

var HardwareSchema = new mongoose.Schema({
    type: {type: String, required: true},
    model: {type: String, required: true, unique: true, set: upperCase},
    serialFormat: {type: String, required: true},
    created_by: {type: mongoose.Schema.ObjectId, required: true, ref: "User"},
    edited_by: {type: mongoose.Schema.ObjectId, required: true, ref: "User"},
    created_at: {type: Date},
    updated_at: {type: Date}
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

Hardware.findByType = function(type, callback){
    this.find({type: type}, callback);
};
Hardware.findByDevice = function(device, callback){
    this.find({device: device}, callback);
};
module.exports = Hardware;