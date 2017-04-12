var express = require('express');
var router = express.Router();
var Company = require("../bin/models/company");



router.get("/", function (req, res, next) {
    Company
        .find()
        .sort("name")
        .exec(function (err, companies) {
            if (err) res.status(500).json(err);
            else res.json(companies);
        })

});
router.get("/:company_id", function (req, res, next) {
    Company.findById(req.params.company_id, function (err, company) {
        if (err) res.status(500).json(err);
        else res.json(company);
    })
})
router.post("/", function (req, res, next) {
    if (req.body.company) {
        const company = {};
        company.name = req.body.company;
        company.created_by = req.session.passport.user.id;
        company.edited_by = req.session.passport.user.id;
        Company(company).save(function (err, company) {
            if (err) res.status(500).json(err);
            else res.json(company);
        });
    } else res.status(400).json({ error: "missing parametesr" });
});

router.post("/:company_id", function (req, res, next) {
    if (req.body.company)
        Company.findById(req.params.company_id, function (err, company) {
            if (err) res.status(500).json(err);
            else {
                if (req.body.company.name) company.name = req.body.company.name;               
                company.edited_by = req.session.passport.user.id;
                company.save(function (err, result) {
                    if (err) res.status(500).json(err);
                    else res.json(result);
                });
            }
        });
    else res.status(400).json({ error: "missing parametesr" });
});

router.delete("/:company_id", function (req, res, next) {
    Company.remove({ "_id": req.params.company_id }, function (err, company) {
        if (err) res.status(500).json(err);
        else res.json(company.result);
    })
});



module.exports = router;