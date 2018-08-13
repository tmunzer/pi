//===============CREATE ROOT PATH=================
var path = require('path');


//===============MONGODB=================
var mongoConfig = require('./config').mongoConfig;
var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
global. db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
    // Create your schemas and models here.
});

mongoose.connect('mongodb://'+mongoConfig.host+'/pi');

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

var morgan = require('morgan');
app.use(morgan('\x1b[32minfo\x1b[0m: :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]', {
  skip: function (req, res) { return res.statusCode < 400 && req.url != "/" && req.originalUrl.indexOf("/api") < 0 && req.originalUrl.indexOf("/webhook") < 0; }
}));

//===============PASSPORT=================
global.passport = require('passport');
var session = require('express-session');

var MongoDBStore = require('connect-mongodb-session')(session);
var mongoSession = session({
  secret: 'ZHxiqtUpjxVYsap5NvY8yuZGFPUg',
  resave: true,
  store: new MongoDBStore({
    uri: 'mongodb://'+mongoConfig.host+'/express-session',
    collection: 'pi'
  }),
  rolling: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 30 * 60 * 1000 // 30 minutes
  },
  unset: "destroy"
}
);

app.use(mongoSession);
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// Initialize Passport
var initPassport = require('./passport/init');
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
var users = require('./routes/api.users');
app.use('/api/users/', users);
app.use('/', function(req, res){
    res.redirect('/web-app/');
});
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
