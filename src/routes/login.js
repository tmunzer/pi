var express = require('express');
var router = express.Router();
var User = require(appRoot + "/bin/models/user");

User
    .find()
    .exec(function (err, users) {
        if (err)
            console.log(err);
        else if (!users)
            new User({ email: "admin@aerohive.com", password: "aerohive", enabled: true }).save(function (err) {
                if (err) console.log(err);
            })        
    })

/* GET home page. */
router.get('/login/', function (req, res, next) {
    res.render('login', { title: 'Pi - Login' });
});
/* Handle Login POST */
router.post('/login/', passport.authenticate('login', {
    successRedirect: '/web-app/',
    failureRedirect: '/login/',
    failureFlash: true
}));

/* Handle Logout */
router.get('/logout/', function (req, res) {
    logger.info("User " + req.user.username + " is now logged out.");
    req.logout();
    req.session.destroy();
    res.redirect('/login/');
});
module.exports = router;
