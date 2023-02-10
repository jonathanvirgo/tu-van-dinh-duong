var express  		= require('express'),
    router   		= express.Router(),
    url             = require('url'),
    crypto          = require('crypto'),
    moment          = require('moment'),
    passport        = require('passport');

router.get('/login', function (req, res, next) {
    var strMsg          = "",
        str_error       = [],
        arrPromise      = [],
        pr_siteKey      = '',
        enableCaptcha   = 0;
    
    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("siteKey", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                pr_siteKey = result[0].body.toString();
            }
            resolve();
        });
    }));
    
    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("enableCaptcha", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                enableCaptcha = parseInt(result[0].body);
            }
            resolve();
        });
    }));
    
    return new Promise(function (resolve, reject) {
        Promise.all(arrPromise).then(function () {
            if(str_error.length > 0){
                strMsg = str_error.toString();
            }
            res.render('user/login.ejs', { 
                siteKey: pr_siteKey,
                message: strMsg,
                enableCaptcha: enableCaptcha 
            });
        })
    });
})

router.post('/login', function (req, res, next) {
    var str_error       = [],
        arrPromise      = [],
        pr_siteKey      = '',
        pr_secretKey    = '',
        enableCaptcha   = 0;
    
    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("siteKey", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                pr_siteKey = result[0].body.toString();
            }
            resolve();
        });
    }));

    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("secretKey", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                pr_secretKey = result[0].body.toString();
            }
            resolve();
        });
    }));
    
    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("enableCaptcha", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                enableCaptcha = parseInt(result[0].body);
            }
            resolve();
        });
    }));

    return new Promise(function (resolve, reject) {
        Promise.all(arrPromise).then(function () {
            var username   = req.body.login_username,
                password   = req.body.login_password,
                resultData = {
                    "status": false,
                    "message": ""
                };
            
            if(username == ""){
                str_error.push("Tên đăng nhập được yêu cầu!");
            }
            if(password == ""){
                str_error.push("Mật khẩu được yêu cầu!");
            }
            if(str_error.length > 0){
                resultData.message = str_error.toString();
                res.send(resultData);
                return;
            }
            if(enableCaptcha == 1){
                var recaptcha = new reCAPTCHA({ 
                    siteKey: pr_siteKey, 
                    secretKey: pr_secretKey 
                });
                recaptcha.validateRequest(req, requestIp.getClientIp(req)).then(function () {
                    webService.SSOLogin(req, username, password).then(function (jsonData) {
                        PRBookingLogin(resultData, jsonData, req, res);
                    });
                }).catch(function (errorCodes) {
                    resultData.message = "Mã bảo mật recaptcha không chính xác!";
                    //resultData.message = recaptcha.translateErrors(errorCodes).toString();
                    res.send(resultData);
                    return;
                });
            } else {
                webService.SSOLogin(req, username, password).then(function (jsonData) {
                    PRBookingLogin(resultData, jsonData, req, res);
                });
            }
        })
    });
})

router.get('/logout', function (req, res, next) {
  req.logout(function(err) {
    if (err) {
        logService.create(req, err).then(function(){
            
        });
        return;
    }
    res.redirect('/');
  });
})

router.post('/signup', function (req, res, next) {
    var str_error       = [],
        arrPromise      = [],
        pr_siteKey      = '',
        pr_secretKey    = '',
        enableCaptcha   = 0;
    
    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("siteKey", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                pr_siteKey = result[0].body.toString();
            }
            resolve();
        });
    }));

    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("secretKey", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                pr_secretKey = result[0].body.toString();
            }
            resolve();
        });
    }));
    
    arrPromise.push(new Promise(function (resolve, reject) {
        settingService.getSettingBySystemName("enableCaptcha", function (err, result, fields) {
            if(err){
                return logService.create(req, err).then(function(){
                    str_error.push(err.sqlMessage);
                    resolve();
                });
            }
            if (result !== undefined) {
                enableCaptcha = parseInt(result[0].body);
            }
            resolve();
        });
    }));

    return new Promise(function (resolve, reject) {
        Promise.all(arrPromise).then(function () {
            var parameter = {
                    full_name: req.body.full_name,
                    email: req.body.email,
                    phone: req.body.phone,
                    address: req.body.address,
                    birthday: req.body.birthday,
                    gender: isNaN(parseInt(req.body.gender)) ? -1 : parseInt(req.body.gender),
                    username: req.body.username,
                    password: req.body.password,
                    confirm_password: req.body.confirm_password
                },  
                resultData = {
                    "status": false,
                    "message": ""
                },
                list_error = {
                    full_name: [],
                    email: [],
                    phone: [],
                    birthday: [],
                    gender: [],
                    username: [],
                    password: [],
                    confirm_password: []
                };
            
            if(parameter.full_name == ""){
                list_error.full_name.push("Họ và tên được yêu cầu!");
            }
            if(parameter.email == ""){
                list_error.email.push("Email được yêu cầu!");
            } else {
                if(!validator.isEmail(parameter.email)){
                    list_error.email.push('Email sử dụng không hợp lệ!');
                }
            }
            if(parameter.phone == ""){
                list_error.phone.push("Số điện thoại được yêu cầu!");
            } else {
                if(!/^[0-9]+$/.test(parameter.phone)){
                    list_error.phone.push("Số điện thoại không hợp lệ");
                }
            }
            if(parameter.birthday == ""){
                list_error.birthday.push("Ngày sinh được yêu cầu!");
            } else {
                var birthday = new Date(parameter.birthday),
                    to_day   = new Date();
                if(birthday >= to_day){
                    list_error.birthday.push("Ngày sinh không được lớn hơn ngày hiện tại!");
                }  
            }
  
            if(parameter.gender == -1){
                list_error.gender.push("Giới tính được yêu cầu!");
            }
            if(parameter.username == ""){
                list_error.username.push("Tên đăng nhập được yêu cầu!");
            } else {
                if (parameter.username.length < 4) {
                    list_error.username.push("Tên đăng nhập ít nhất 4 ký tự");
                }
                if (parameter.username.length > 65) {
                    list_error.username.push('Tên đăng nhập không được quá 65 ký tự');
                }
                if (!validator.matches(parameter.username, "^[a-zA-Z0-9_\.\-]*$")) {
                    list_error.username.push('Tên truy cập của bạn không hợp lệ!');
                }
            }
            if(parameter.password == ""){
                list_error.password.push("Mật khẩu được yêu cầu!");
            }
            if(parameter.confirm_password == ""){
                list_error.confirm_password.push("Xác nhận mật khẩu được yêu cầu!");
            }
            if (parameter.password !== parameter.confirm_password) {
                list_error.confirm_password.push('Mật khẩu và xác nhận mật khẩu không đúng!');
            }
            if(parameter.password !== "" && parameter.confirm_password){
                if (parameter.password.length < 9) {
                    list_error.password.push("Mật khẩu sử dụng tối thiểu 9 ký tự");
                }
            }
            if(str_error.length > 0 || 
               list_error.full_name.length > 0 || 
               list_error.email.length > 0 || 
               list_error.phone.length > 0 || 
               list_error.birthday.length > 0 || 
               list_error.gender.length > 0 || 
               list_error.username.length > 0 || 
               list_error.password.length > 0 || 
               list_error.confirm_password.length > 0){
                resultData.message = str_error.toString();
                resultData.error   = list_error;
                res.send(resultData);
                return;
            }
            if(enableCaptcha == 1){
                var recaptcha = new reCAPTCHA({ 
                    siteKey: pr_siteKey, 
                    secretKey: pr_secretKey 
                });
                recaptcha.validateRequest(req, requestIp.getClientIp(req)).then(function () {
                    SSO_CreateUser(resultData, list_error, parameter, req, res);
                }).catch(function (errorCodes) {
                    resultData.message = "Mã bảo mật recaptcha không chính xác!";
                    //resultData.message = recaptcha.translateErrors(errorCodes).toString();
                    res.send(resultData);
                    return;
                });
            } else {
                SSO_CreateUser(resultData, list_error, parameter, req, res);
            }
        })
    });
})

router.get('/checkuname', function(req, res) {
    var resultData = {
        status: false,
        message: ""
    };
    try {
        var query = url.parse(req.url, true).query,
            uname = query.uname == undefined ? "" : query.uname;
        
        webService.SSOCheckUsernameExist(req, uname).then(function(responseData) {
            if(!responseData.status){
                resultData.message = responseData.message;
                res.json(resultData);
                return;
            }
            if(parseInt(responseData.data.data) > 0){
                resultData.message = "Tên đăng nhập đã tồn tại trên hệ thống!";
                res.json(resultData);
                return;
            }
            if(responseData.data.errmsg !== ""){
                resultData.message = "Tên đăng nhập không hợp lệ!";
                res.json(resultData);
                return;
            }
            resultData.status = true;
            res.json(resultData);
        });
    } catch (e) {
        resultData.message = e.message;
        res.json(resultData);
    }
})

router.get('/checkphone', function(req, res) {
    var resultData = {
        status: false,
        message: ""
    };
    try {
        var query = url.parse(req.url, true).query,
            phone = query.phone == undefined ? "" : query.phone;
        
        webService.SSOCheckPhoneExist(req, phone).then(function(responseData) {
            if(!responseData.status){
                resultData.message = responseData.message;
                res.json(resultData);
                return;
            }
            if(parseInt(responseData.data.data) == 1){
                resultData.message = "Số điện thoại đã tồn tại trên hệ thống!";
                res.json(resultData);
                return;
            }
            if(responseData.data.errmsg !== ""){
                resultData.message = "Số điện thoại không đúng định dạng!";
                res.json(resultData);
                return;
            }
            resultData.status = true;
            res.json(resultData);
        });
    } catch (e) {
        resultData.message = e.message;
        res.json(resultData);
    }
})

router.get('/checkemail', function(req, res) {
    var resultData = {
        status: false,
        message: ""
    };
    try {
        var query = url.parse(req.url, true).query,
            email = query.email == undefined ? "" : query.email;
        
        webService.SSOCheckEmailExist(req, email).then(function(responseData) {
            if(!responseData.status){
                resultData.message = responseData.message;
                res.json(resultData);
                return;
            }
            if(parseInt(responseData.data.data) > 0){
                resultData.message = "Email đã tồn tại trên hệ thống!";
                res.json(resultData);
                return;
            }
            if(responseData.data.errmsg !== ""){
                resultData.message = "Email không đúng định dạng!";
                res.json(resultData);
                return;
            }
            resultData.status = true;
            res.json(resultData);
        });
    } catch (e) {
        resultData.message = e.message;
        res.json(resultData);
    }
})

router.post('/checkpassword', function(req, res) {
    var resultData = {
        status: false,
        message: ""
    };
    try {
        var password = req.body.password;
        webService.SSOCheckPassWord(req, password).then(function(responseData) {
            if(!responseData.status){
                resultData.message = responseData.message;
                res.json(resultData);
                return;
            }
            if(parseInt(responseData.data.data) == 0){
                resultData.message = "Mật khẩu không hợp lệ!";
                res.json(resultData);
                return;
            }
            if(responseData.data.errmsg !== ""){
                resultData.message = "Mật khẩu không hợp lệ.";
                res.json(resultData);
                return;
            }
            resultData.status = true;
            res.json(resultData);
        });
    } catch (e) {
        resultData.message = e.message;
        res.json(resultData);
    }
})

router.get('/profile', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 2).then(function(filter){
            var str_errors   = filter.error,
                arrPromise   = [],
                pr_user      = [];

            arrPromise.push(new Promise(function (resolve, reject) {
                userService.getUserById(req.user.id, function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(log_id){
                            str_errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    if (result !== undefined) {
                        pr_user = result[0];
                    }
                    resolve();
                });
            }));
            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    res.render('user/profile.ejs', { 
                        user: req.user,
                        errors: str_errors,
                        pr_user: pr_user,
                        moment: moment,
                        filter: filter
                    });
                }).catch(err => {
                    res.render("user/profile.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter
                    });
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            res.render("user/profile.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter
            });
        })
    }
})

module.exports = router;
