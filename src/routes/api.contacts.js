const express = require('express');
const router = express.Router();
const Contact = require("../bin/models/contact");



router.get("/", function (req, res, next) {
    const filters = {};
    if (req.query.search) {
        Contact.find({
            $or: [{
                name: {
                    "$regex": req.query.search,
                    "$options": "i"
                }
            }, {
                email: {
                    "$regex": req.query.search,
                    "$options": "i"
                }
            }]
        }, function (err, contacts) {
            if (err) res.status(500).json(err);
            else res.json(contacts);
        });
    } else {
        if (req.query.id) filters._id = req.query.id;
        if (req.query.companyId) filters.companyId = req.query.companyId;
        if (req.query.email) filters.email = req.query.email;
        if (req.query.name) filters.name = req.query.name;
        Contact
            .find(filters)
            .populate('companyId')
            .sort("name")
            .exec(function (err, contacts) {
                if (err) res.status(500).json(err);
                else res.json(contacts);
            })
    }
});
router.get("/:contact_id", function (req, res, next) {
    Contact
        .findOne({'_id': req.params.contact_id})
        .populate("companyId")
        .exec(function (err, contact) {
            if (err) res.status(500).json(err);
            else res.json(contact);
        });
});
router.post("/", function (req, res, next) {
    if (req.body.contact) {
        const contact = req.body.contact;
        contact.created_by = req.session.passport.user.id;
        contact.edited_by = req.session.passport.user.id;
        Contact(contact).save(function (err, contact) {
            if (err) res.status(500).json(err);
            else res.json(contact);
        });
    } else res.status(400).json({
        error: "missing parametesr"
    });
});

router.post("/:contact_id", function (req, res, next) {
    if (req.body.contact)
        Contact.findById(req.params.contact_id, function (err, contact) {
            if (err) res.status(500).json(err);
            else {
                contact.companyId = req.body.contact.companyId;
                contact.name = req.body.contact.name;
                contact.phone = req.body.contact.phone;
                contact.email = req.body.contact.email;
                contact.edited_by = req.session.passport.user.id;
                contact.save(function (err, result) {
                    if (err) res.status(500).json(err);
                    else res.json(result);
                });
            }
        });
    else res.status(400).json({
        error: "missing parametesr"
    });
});

router.delete("/:contact_id", function (req, res, next) {
    Contact.remove({
        "_id": req.params.contact_id
    }, function (err, contact) {
        if (err) res.status(500).json(err);
        else res.json(contact.result);
    })
});



module.exports = router;