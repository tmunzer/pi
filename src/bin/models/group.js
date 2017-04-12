var mongoose = require('mongoose');

function capitalize (val){
    if (typeof val !== 'string') val = '';
    return val.charAt(0).toUpperCase() + val.substring(1);
}

var GroupSchema = new mongoose.Schema({
    name: {type: String, required: true, set: capitalize},
    created_at: {type: Date},
    updated_at: {type: Date}
});
// Pre save
GroupSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});
module.exports = mongoose.model('Group', GroupSchema);