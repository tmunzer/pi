//===============CREATE ROOT PATH=================
var path = require('path');
global.appRoot = path.resolve(__dirname);


//===============MONGODB=================
var mongoose = require('mongoose');
global. db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
    // Create your schemas and models here.
});

mongoose.connect('mongodb://localhost/pi');

//===============DEPENDENCIES=================
var express = require('express');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//===============CREATE APP=================
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static('../bower_components'));

//=============CREATE LOGGER===============
var winston = require('winston');
winston.emitErrs = true;
global.logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: __dirname + '/logs/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

logger.stream = {
    write: function(message, encoding){
        logger.info(message);
    }
};

logger.debug("Overriding 'Express' logger");
app.use(require('morgan')("default", { "stream": logger.stream }));

//===============PASSPORT=================
global.passport = require('passport');
var session = require('express-session');

var MongoDBStore = require('connect-mongodb-session')(session);
var mongoSession = session({
  secret: 'ZHxiqtUpjxVYsap5NvY8yuZGFPUg',
  resave: true,
  store: new MongoDBStore({
    uri: 'mongodb://localhost/express-session',
    collection: 'pi'
  }),
  saveUninitialized: true,
  cookie: {
    maxAge: 60 * 60 * 1000 // 60 minutes
  }
});
app.use(mongoSession);
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require(appRoot + '/passport/init');
initPassport(passport);

//===============ROUTES=================
app.all('*', function(req,res,next){
    if (req.path === '/logout/' || req.path === '/login/') return next();
    // if user is authenticated in the session, call the next() to call the next request handler
    // Passport adds this method to request object. A middleware is allowed to add properties to
    // request and response objects
    else if (req.isAuthenticated()) return next();
    // if the user is not authenticated then redirect him to the login page
    else return res.redirect('/login/');
});
var login = require('./routes/login');
app.use('/', login);
var index = require('./routes/web-app');
app.use('/web-app/', index);
var hardwares = require('./routes/api.hardwares');
app.use('/api/hardwares/', hardwares);
var devices = require('./routes/api.devices');
app.use('/api/devices/', devices);
var loans = require('./routes/api.loans');
app.use('/api/loans/', loans);
var companies = require('./routes/api.companies');
app.use('/api/companies/', companies);
var contacts = require('./routes/api.contacts');
app.use('/api/contacts/', contacts);
var api = require('./routes/api');
app.use('/api/', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
