var mongoose = require('mongoose');
var Company = require('./company')

function capitalize(val) {
    if (typeof val !== 'string') val = '';
    return val.charAt(0).toUpperCase() + val.substring(1);
}

function validateEmail(email) {
    if (email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
    } else return true;
}

var ContactSchema = new mongoose.Schema({
    companyId: {type: mongoose.Schema.ObjectId, required: true, ref: "Company"},
    name: { type: String, required: true, set: capitalize, trim: true, unique: true},
    email: { type: String, unique: false, validator: validateEmail },
    phone: { type: String },
    created_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    edited_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    created_at: { type: Date },
    updated_at: { type: Date }
});


// Pre save
ContactSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var Contact = mongoose.model('Contact', ContactSchema);

Contact.findByEmail = function (email, callback) {
    this.findOne({ email: email }, callback);
};
Contact.findById = function (id, callback) {
    this.findOne({ _id: id }, callback);
}

module.exports = Contact;