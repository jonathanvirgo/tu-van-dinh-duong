var createError       = require('http-errors');
var express           = require('express');
var path              = require('path');
var cookieParser      = require('cookie-parser');
var logger            = require('morgan');
var bodyParser        = require('body-parser');
var expressSession   = require('express-session');
var flash            = require('express-flash');
var passport         = require('passport');
var favicon          = require('serve-favicon');

//Web
var home       = require('./app/web/controllers/homeController');
var user       = require('./app/web/controllers/userController');
var mail       = require('./app/web/controllers/sendMailController');

//Admin
var admin          = require('./app/admin/controllers/adminController');
var admin_user     = require('./app/admin/controllers/userController');
var admin_role     = require('./app/admin/controllers/roleController');
var admin_setting  = require('./app/admin/controllers/settingController');
var admin_error    = require('./app/admin/controllers/errorController');
var admin_log      = require('./app/admin/controllers/logController');

require('./app/config/passport')(passport);

var db              = require('./app/config/db');
var EventEmitter    = require('events').EventEmitter;
var event           = new EventEmitter();
event.setMaxListeners(0);
db.connect(db.MODE_PRODUCTION, function () {
  console.log('Conenct Database successfully');
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, '/app/web/views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave: false,
  saveUninitialized: true,
  secret: 'secretprnews!@#!' 
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use(favicon(path.join(__dirname, 'public', 'content/images', 'favicon.ico')));
app.use("/public", express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: false }));
app.use(cookieParser());

//Web
app.use('/', home);
app.use('/user', user);
app.use('/mail', mail);

//Admin
app.use('/admin', admin);
app.use('/admin/user', admin_user);
app.use('/admin/role', admin_role);
app.use('/admin/setting', admin_setting);
app.use('/admin/error', admin_error);
app.use('/admin/log', admin_log);

app.get('/robots.txt', function (req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow: /public/")
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.status(404).render("error/error.ejs", {
      user: req.user,
      errors: []
  });
});

// error handler
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(500).render("error/error.ejs", {
      user: req.user,
      filter: filter,
      errors: [err.message]
    });
  });
}

module.exports = app;
