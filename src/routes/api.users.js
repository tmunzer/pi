const express = require('express');
const router = express.Router();
const User = require("../bin/models/user");

router.get("/", function (req, res, next) {
    if (req.query.id) {
        User.findById(req.query.id, function (err, user) {
            if (err) res.status(500).json(err);
            else res.json(user);
        })
    } else
        User.find()
            .exec(function (err, users) {
                if (err) res.status(500).json(err);
                else res.json({ currentUser: req.session.passport.user.id, users: users });
            })
});
router.post("/", function (req, res, next) {
    if (req.body.user) {
        const user = req.body.user;
        user.created_by = req.session.passport.user.id;
        user.edited_by = req.session.passport.user.id;
        User(user).save(function (err, user) {
            if (err) res.status(500).json(err);
            else res.json(user);
        });
    } else res.status(400).json({ error: "missing parametesr" });
});
module.exports = router;
