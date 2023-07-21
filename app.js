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
var examine    = require('./app/web/controllers/examineController');
var exportDoc  = require('./app/web/controllers/exportDocController');
var weather    = require('./app/web/controllers/weatherController');
var test       = require('./app/web/controllers/testController');
var api        = require('./app/web/controllers/apiController');

//Admin
var admin          = require('./app/admin/controllers/adminController');
var admin_user     = require('./app/admin/controllers/userController');
var admin_role     = require('./app/admin/controllers/roleController');
var admin_setting  = require('./app/admin/controllers/settingController');
var admin_error    = require('./app/admin/controllers/errorController');
var admin_log      = require('./app/admin/controllers/logController');
var admin_hospital    = require('./app/admin/controllers/hospitalController');
var admin_department  = require('./app/admin/controllers/departmentController');
var admin_active_mode_of_living  = require('./app/admin/controllers/activeModeOfLivingController');
var admin_nutrition_advice  = require('./app/admin/controllers/nutritionAdviceController');
var admin_medicine  = require('./app/admin/controllers/medicineController');
var admin_alternative_food  = require('./app/admin/controllers/alternativeFoodController');
var admin_food_type  = require('./app/admin/controllers/foodTypeController');
var admin_food_info  = require('./app/admin/controllers/foodInfoController');
var admin_medical_test  = require('./app/admin/controllers/medicalTestController');
var admin_medical_test_type = require('./app/admin/controllers/medicalTestTypeController');
var admin_menu_time  = require('./app/admin/controllers/menuTimeController');
var admin_diagnostic  = require('./app/admin/controllers/diagnosticController');
var admin_standard_weight_height  = require('./app/admin/controllers/standardWeightHeightController');
var admin_menu_example = require('./app/admin/controllers/menuExampleController');
var admin_nutritional_needs = require('./app/admin/controllers/nutritionalNeedsController');
var admin_index_by_age = require('./app/admin/controllers/indexByAgeController');
var admin_height_by_weight = require('./app/admin/controllers/heightByWeightController');

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
  secret: 'secrettuvandinhduong!@#!' ,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  }
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
app.use('/examine', examine);
app.use('/mail', mail);
app.use('/export', exportDoc);
app.use('/weather', weather);
app.use('/test', test);
app.use('/api', api);

//Admin
app.use('/admin', admin);
app.use('/admin/user', admin_user);
app.use('/admin/role', admin_role);
app.use('/admin/setting', admin_setting);
app.use('/admin/error', admin_error);
app.use('/admin/log', admin_log);
app.use('/admin/hospital', admin_hospital);
app.use('/admin/department', admin_department);
app.use('/admin/active-mode-of-living', admin_active_mode_of_living);
app.use('/admin/nutrition-advice', admin_nutrition_advice);
app.use('/admin/medicine', admin_medicine);
app.use('/admin/alternative-food', admin_alternative_food);
app.use('/admin/food-type', admin_food_type);
app.use('/admin/food-info', admin_food_info);
app.use('/admin/medical-test', admin_medical_test);
app.use('/admin/medical-test-type', admin_medical_test_type);
app.use('/admin/menu-time', admin_menu_time);
app.use('/admin/diagnostic', admin_diagnostic);
app.use('/admin/standard-weight-height', admin_standard_weight_height);
app.use('/admin/menu-example', admin_menu_example);
app.use('/admin/nutritional-needs', admin_nutritional_needs);
app.use('/admin/index-by-age', admin_index_by_age);
app.use('/admin/height-by-weight', admin_height_by_weight);

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
