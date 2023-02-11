var express  		= require('express'),
    router   		= express.Router(),
    url             = require('url'),
    crypto          = require('crypto'),
    moment          = require('moment'),
    passport        = require('passport'),
    validator       = require("validator"),
    webService      = require('./../models/webModel'),
    adminService    = require('../../admin/models/adminModel'),
    logService      = require('../../admin/models/logModel'),
    userService     = require('../../admin/models/userModel'),
    roleUserService = require('../../admin/models/roleUsersModel'),
    settingService  = require('../../admin/models/settingModel'),
    mailService     = require('./../service/sendMail');

router.get('/login', function (req, res, next) {
    return res.render('user/login.ejs');
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
            PRBookingLogin(resultData, {}, req, res);
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
        pr_secretKey    = '';
    
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

            SSO_CreateUser(resultData, list_error, parameter, req, res);
        })
    });
})

router.get('/activeaccount/:token', function (req, res) {
    userService.getUserByActivePasswordToken(req.params.token, new Date(Date.now())).then(function (responseData) {
        if(!responseData.success){
            res.render('user/activeaccount.ejs', { 
                message: responseData.message
            });
        } else {
            var user = responseData.data[0];
            if (!user) {
                res.render('user/activeaccount.ejs', { 
                    message: 'Mã kích hoạt tài khoản của bạn không hợp lệ hoặc đã hết hạn.'
                });
            } else {
                var iusers = {
                    activePasswordToken: undefined,
                    resetPasswordExpires: undefined,
                    active: 1,
                    id: user.id
                };
                userService.activeaccount(iusers, function (err, reUser, fields) {
                    res.render('user/activeaccount.ejs', { 
                        message: 'Tài khoản của bạn đã được kích hoạt.'
                    });
                });
            }
        }
    });
});

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

function SSO_CreateUser(resultData, list_error, parameter, req, res) {
    var str_error     = [],
        userPromise   = [],
        passwordData  = adminService.sha512(parameter.password, adminService.salt()),
        pr_user       = {
            user_id: 0,
            name: parameter.username,
            full_name: parameter.full_name,
            password: passwordData.passwordHash,
            email: parameter.email,
            phone: parameter.phone,
            gender: parameter.gender,
            birthday: parameter.birthday.split("-").reverse().join("-"),
            address: parameter.address,
            activePasswordToken: "",
            resetPasswordExpires: new Date(Date.now() + 3600000),
            active: 1,
        };

    return new Promise(function (resolve, reject) {
        Promise.all(userPromise).then(function () {
            if(str_error.length > 0){
                resultData.message = str_error.toString();
                res.send(resultData);
                return;
            }
            if(list_error.full_name.length > 0 || 
               list_error.email.length > 0 || 
               list_error.phone.length > 0 || 
               list_error.birthday.length > 0 || 
               list_error.gender.length > 0 || 
               list_error.username.length > 0 || 
               list_error.password.length > 0 || 
               list_error.confirm_password.length > 0){
                resultData.error = list_error;
                res.send(resultData);
                return;
            }
            pr_user.user_id = isNaN(parseInt(jsonUser.data.data)) ? 0 : parseInt(jsonUser.data.data);
            userService.create(pr_user, function (err, reUser, fields) {
                if (err) {
                    logService.create(req, err).then(function(){
                        resultData.message = err.sqlMessage;
                        res.send(resultData);
                    });
                    return;
                }
                if (reUser.insertId !== undefined) {    
                    roleUserService.create({user_id: reUser.insertId, role_id: 2}, function (err, rsRole, fields) {
                        if (err) {
                            logService.create(req, err).then(function(){
                                resultData.message = err.sqlMessage;
                                res.send(resultData);
                            });
                            return;
                        }
                        //var activeaccount = 'http://' + req.headers.host + '/user/activeaccount/' + pr_user.activePasswordToken;
                        //mailService.mail_signup(parameter.email, activeaccount).then(function(responseData){
                            resultData.status  = true;
                            resultData.message = "Đăng ký thành công. Vui lòng kiểm tra email " + parameter.email + " để kích hoạt tài khoản theo hướng dẫn trước khi đăng nhập hệ thống!";
                            res.send(resultData);
                        //})
                    })
                } else {
                    resultData.message = "Dữ liệu trả về không xác định!";
                    res.send(resultData);
                }
            })
        });
    });
}

function PRBookingLogin(resultData, jsonData, req, res) {
    var str_error = [],
        user_data = jsonData.data,
        errmsg    = user_data.errmsg;
    
    if(jsonData.status == 0){
        str_error.push(jsonData.message);
    }
    if (errmsg !== "") {
        str_error.push(errmsg);
    }

    if(str_error.length > 0){
        resultData.message = str_error.toString();
        res.send(resultData);
        return;
    }
    var dataToken = webService.readyToken(user_data.data);
    if (dataToken.uid > 0) {
        var ctt = new Date(dataToken.ctt).getTime();
        if (ctt != null) {
            loginLocal(resultData, result[0], req, res);
        }
    }
}

function loginLocal(resultData, user, req, res){
    req.logIn(user, function (err) {
        if (!user || err) {
            logService.create(req, err).then(function(){
                resultData.message = err;
                res.send(resultData);
            });
            return;
        }
        if(user.active == 0){
            resultData.message = "Tài khoản của bạn chưa được kích hoạt!";
            res.send(resultData);
            return;
        }
        resultData.status  = true;
        resultData.message = "Đăng nhập thành công!";
        res.send(resultData);
    });
}
module.exports = router;
