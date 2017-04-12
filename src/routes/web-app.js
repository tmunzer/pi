var express = require('express');
var router = express.Router();
var User = require("../bin/models/user");
/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('web-app', {title: 'Express'});
});

module.exports = router;
