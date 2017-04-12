var mongoose = require('mongoose');
var bCrypt = require('bcrypt');

function cryptPassword(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}

function capitalize(val) {
    if (typeof val !== 'string') val = '';
    return val.charAt(0).toUpperCase() + val.substring(1);
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

var UserSchema = new mongoose.Schema({
    name: {
        first: { type: String, set: capitalize, trim: true, default: "" },
        last: { type: String, set: capitalize, trim: true, default: "" }
    },
    email: { type: String, required: true, unique: true, validator: validateEmail },
    password: { type: String, required: true, set: cryptPassword },
    enabled: Boolean,
    lastLogin: Date,
    comment: String,
    created_at: { type: Date },
    updated_at: { type: Date }
});


// Pre save
UserSchema.pre('save', function (next) {
    var now = new Date();
    this.updated_at = now;
    if (!this.created_at) {
        this.created_at = now;
    }
    next();
});

var User = mongoose.model('User', UserSchema);
User.newLogin = function (email, password, callback) {
    this.findOne({ email: email }, function (err, user) {
        if (err) callback(err, null);
        else if (!user) {
            console.log("no user");
            callback(null, false);
        }
        else {
            if (user.enabled == false) callback(null, false);
            else if (!bCrypt.compareSync(password, user.password)) callback(null, false);
            else {
                user.lastLogin = new Date();
                user.save(function (err) {
                    console.log(err);
                    callback(null, user);
                });
            }
        }
    })
};


User.findByEmail = function (email, callback) {
    this.findOne({ email: email }, callback);
};
User.findById = function (id, callback) {
    this.findOne({ _id: id }, callback);
}
// Validation
/*UserSchema.path('email').validate(function(value, done) {
);
*/
// Pre Validate
/*UserSchema.pre('validate', function() {
    console.log('this gets printed first');
});
*/
module.exports = User;