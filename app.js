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

require('./app/config/passport')(passport);

var db                = require('./app/config/db');
db.connect(db.MODE_PRODUCTION, function () {
  console.log('Conenct Database successfully');
})

var EventEmitter    = require('events').EventEmitter;
var event           = new EventEmitter();
event.setMaxListeners(0);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

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

//Admin


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
