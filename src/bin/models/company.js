const mongoose = require('mongoose');


function capitalize(val) {
    if (typeof val !== 'string') val = '';
    return val.charAt(0).toUpperCase() + val.substring(1);
}


const CompanySchema = new mongoose.Schema({
    name: { type: String, required: true, set: capitalize, trim: true, unique: true },
    created_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    edited_by: { type: mongoose.Schema.ObjectId, required: true, ref: "User" },
    created_at: { type: Date },
    updated_at: { type: Date }
});


// Pre save
CompanySchema.pre('save', function (next) {
    const now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

const Company = mongoose.model('Company', CompanySchema);
Company.load = function (filters, cb) {
    const Contact = require("./contact");
    let done = 0;
    this.find(filters)
        .sort('name')
        .exec(function (err, companies) {
            if (err) cb(err);
            else {
                companies = JSON.parse(JSON.stringify(companies))
                companies.forEach(function (company) {
                    Contact
                        .find({ companyId: company._id })
                        .count(function (err, count) {
                            if (err) {
                                console.log(err)
                                cb(err);
                            }
                            else {
                                company.contacts = count;
                                done++;
                            }
                            if (done == companies.length) cb(null, companies);
                        })
                });
            }
        });
}

module.exports = Company;