const express = require('express');
const router = express.Router();
const User = require("../bin/models/user");

router.get("/", function (req, res, next) {
    if (req.query.id) {
        User.findByIdWithoutPassword(req.query.id, function (err, user) {
            if (err) res.status(500).json(err);
            else res.json(user);
        })
    } else
        User.findWithoutPassword({}, function (err, users) {
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
            else {
                user = JSON.parse(JSON.stringify(user));
                delete user.password;
                res.json(user);
            }
        });
    } else res.status(400).json({ error: "missing parametesr" });
});
router.post("/:user_id", function (req, res, next) {
    if (req.body.user)
        User.findById(req.params.user_id, function (err, user) {
            if (err) res.status(500).json(err);
            else {
                user.name = req.body.user.name;
                user.email = req.body.user.email;
                user.enabled = req.body.user.enabled;
                user.edited_by = req.session.passport.user.id;
                user.save(function (err, user) {
                    if (err) res.status(500).json(user);
                    else {
                        user = JSON.parse(JSON.stringify(user));
                        delete user.password;
                        res.json(user);
                    }
                });
            }
        });
    else res.status(400).json({ error: "missing parametesr" });
});
router.post("/:user_id/password", function (req, res, next) {
    if (req.body.password)
        User.findById(req.params.user_id, function (err, user) {
            if (err) res.status(500).json(err);
            else {
                user.password = req.body.password;
                user.save(function (err, user) {
                    if (err) res.status(500).json(user);
                    else {
                        user = JSON.parse(JSON.stringify(user));
                        delete user.password;
                        res.json(user);
                    }
                })
            }
        })
})

module.exports = router;
