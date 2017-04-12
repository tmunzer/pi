const express = require('express');
const router = express.Router();
const User = require("../bin/models/user");

router.get("/users/", function(req, res, next){
    User.find()
        .exec(function(err, users){
            if (err) res.status(500).json(err);
            else res.json({currentUser: req.session.passport.user.id, users: users});
        })
});

module.exports = router;
