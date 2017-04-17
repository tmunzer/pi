const express = require('express');
const router = express.Router();
const User = require("../bin/models/user");
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('web-app', {title: 'P!'});
});

module.exports = router;
