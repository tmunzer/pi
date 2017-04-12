var LocalStrategy = require('passport-local').Strategy;
var User = require(appRoot + '/bin/models/user');

module.exports = function (passport) {

    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            // check in mongo if a user with username exists or not
            User.newLogin(username, password, function (err, user) {
                console.log('==--');
                console.log(err, user);
                console.log('==--');
                if (err || !user) {
                    logger.warn("User "+ username + ': Wrong login or password');
                    return done(null, false, req.flash("message", "error_login_password"));
                } else {
                    logger.info("User " + user.email + " is now logged in");
                    return done(null, user);
                }
            });
            // User and password both match, return user from done method
            // which will be treated like success

        }
    ));

};