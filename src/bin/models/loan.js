var mongoose = require('mongoose');
var Device = require("./device");
var User = require("./user");
var User = require("./contact");
var User = require("./company");

var loanSchema = new mongoose.Schema({
    deviceId: [{ type: mongoose.Schema.ObjectId, required: true, ref: "Device" }],
    poe: {type: Number, required: false, default: 0},
    other: {type: String, required: false},
    companyId: { type: mongoose.Schema.ObjectId, required: true, ref: "Company" },
    contactId: { type: mongoose.Schema.ObjectId, required: true, ref: "Contact" },
    ownerId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    estimatedEndDate: { type: Date, required: true },
    endDate: { type: Date, required: false, default: null },
    comments: [{
        date: { type: Date, required: true },
        userId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
        comment: { type: String, required: true }
    }],
    aborted: {type: Boolean, required: false},
    created_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    edited_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    created_at: { type: Date },
    updated_at: { type: Date }
});

loanSchema.statics.findNotReturned = function (callback) {
    return this.find({ returnedDate: null }, callback);
};
// Pre save
loanSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});
module.exports = mongoose.model('Loan', loanSchema);