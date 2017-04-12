var mongoose = require('mongoose');

function capitalize(val) {
    if (typeof val !== 'string') val = '';
    return val.charAt(0).toUpperCase() + val.substring(1);
}


var CompanySchema = new mongoose.Schema({
    name: { type: String, required: true, set: capitalize, trim: true},
    created_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    edited_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    created_at: { type: Date },
    updated_at: { type: Date }
});


// Pre save
CompanySchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Company = mongoose.model('Company', CompanySchema);

module.exports = Company;