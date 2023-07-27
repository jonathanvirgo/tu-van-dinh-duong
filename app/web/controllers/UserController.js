var express  		= require('express'),
    router   		= express.Router(),
    crypto          = require('crypto'),
    moment          = require('moment'),
    validator       = require("validator"),
    webService      = require('../models/webModel'),
    adminService    = require('../../admin/models/adminModel'),
    logService      = require('../../admin/models/logModel'),
    userService     = require('../../admin/models/userModel'),
    roleUserService = require('../../admin/models/roleUsersModel'),
    env             = require('dotenv').config();

router.get('/login', function (req, res, next) {
    return res.render('user/login.ejs', {reCAPTCHA_site_key: env.parsed.SITEKEYRECAPTCHA});
})

router.post('/login', function (req, res, next) {
    try {
        var str_error       = [];
        var username   = req.body.username,
            password   = req.body.password,
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

        let passwordData  = webService.saltHashPassword(password);
        let sqlGetListRequest = 'SELECT * FROM user WHERE ( phone = ? OR email = ?) AND password = ?';
        webService.getListTable(sqlGetListRequest ,[username, username, passwordData]).then(responseData =>{
            if(!responseData.success){
                resultData.message = "Tên đăng nhập chưa được đăng ký"; 
                res.send(resultData);
                return;
            }
            if(responseData.data && responseData.data.length > 0){
                if(responseData.data[0].active == 1){
                    req.logIn(responseData.data[0], function (err) {
                        if (err) {
                            logService.create(req, err).then(function(responseData){
                                if(responseData.message) resultData.message = responseData.message;
                                else resultData.message = err.sqlMessage;
                                res.send(resultData);
                            });
                            return;
                        }
                        resultData.status  = true;
                        resultData.message = "Đăng nhập thành công!";
                        res.send(resultData);
                        return;
                    });
                }else{
                    resultData.message = "Tài khoản chưa được kích hoạt! Vui lòng kiểm tra email kích hoạt tài khoản!";
                    res.send(resultData);
                    return;
                }
            }else{
                resultData.message = "Đăng nhập không thành công! Sai email, số điện thoại hoặc mật khẩu"; 
                res.send(resultData);
                return;
            }
        });

    } catch (error) {
        logService.create(req, error.message).then(function(responseData) {
            resultData.message = error.message;
            res.json(resultData);
        });
    }
})

router.get('/logout', function (req, res, next) {
  req.logout(function(err) {
    if (err) {
        logService.create(req, err).then(function(responseData){
            
        });
        return;
    }
    res.redirect('/');
  });
})

router.post('/signup', function (req, res, next) {
    var str_error       = [];

    return new Promise(function (resolve, reject) {
        try {
            var parameter = {
                full_name: req.body.full_name,
                email: req.body.email,
                phone: req.body.phone,
                address: req.body.address,
                birthday: req.body.birthday,
                gender: isNaN(parseInt(req.body.gender)) ? 2 : parseInt(req.body.gender),
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
                
            } else {
                var birthday = new Date(parameter.birthday),
                    to_day   = new Date();
                if(birthday >= to_day){
                    list_error.birthday.push("Ngày sinh không được lớn hơn ngày hiện tại!");
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
                list_error.email.length > 0 || 
                list_error.phone.length > 0 || 
                list_error.birthday.length > 0 || 
                list_error.password.length > 0 || 
                list_error.confirm_password.length > 0){
                resultData.message = str_error.toString();
                resultData.error   = list_error;
                res.send(resultData);
                return;
            }

            createUser(resultData, list_error, parameter, req, res);
        } catch (error) {
            logService.create(req, error.message).then(function(responseData) {
                resultData.message = error.message;
                res.send(resultData);
            });
        }
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

router.get('/profile', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 0).then(function(filter){
            var str_errors   = filter.error,
                department   = [],
                pr_user      = [];

            userService.getUserById(req.user.id, async function (err, result, fields) {
                if (err) {
                    await logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_errors.push(responseData.message);
                        else str_errors.push(err.sqlMessage);
                    });
                }else{
                    if (result !== undefined) {
                        pr_user = result[0];
                    }
                }
                let dataDepartment = await webService.getListTable('SELECT id, `name` FROM department WHERE hospital_id = ? AND active = 1 ', [req.user.hospital_id]); 
                if(dataDepartment.success){
                    department = dataDepartment.data;
                }else{
                    str_errors.push(dataDepartment.message);
                }
                res.render('user/profile.ejs', { 
                    user: req.user,
                    errors: str_errors,
                    pr_user: pr_user,
                    moment: moment,
                    filter: filter,
                    department: department,
                    link: ''
                });
            });

        });
    } catch (e) {
        webService.createSideBarFilter(req, 0).then(function(dataFilter) {
            res.render("user/profile.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter,
                link: ''
            });
        })
    }
});

router.post('/profile', async function(req, res){
    var resultData = {
        success: false,
        message: ''
    };
    try {  
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        let parameter = {
            hospital_id: req.body.hospital_id,
            department_id: req.body.department_id,
            full_name: req.body.name,
            gender: req.body.gender,
            birthday: req.body.birthday,
            address: req.body.address
        }
        parameter.birthday = parameter.birthday.split("-").reverse().join("-");
        if(!parameter.hospital_id || !parameter.department_id || !parameter.full_name || !parameter.gender || !parameter.birthday || !parameter.address){
            resultData.message = !hospital_id ? "Chưa chọn bệnh viện!" : "Chưa chọn khoa!";
            resultData.message += !parameter.full_name || !parameter.gender || !parameter.birthday || !parameter.address ? ' Thiếu dữ liệu' : '';
            res.json(resultData);
            return;
        }else{
            let responseData = await webService.updateRecordTable(parameter, {id: req.user.id}, 'user');
            // data: OkPacket {
            //     fieldCount: 0,
            //     affectedRows: 1,
            //     insertId: 0,
            //     serverStatus: 2,
            //     warningCount: 0,
            //     message: '(Rows matched: 1  Changed: 1  Warnings: 0',
            //     protocol41: true,
            //     changedRows: 1
            // }
            if(responseData.success && responseData.data && responseData.data.changedRows == 1){
                resultData.message = 'Thành công!';
                resultData.success = true;
            }else{
                resultData.message = responseData.message;
            }
            res.json(resultData);
        }
    } catch (error) {
        
    }
});

function createUser(resultData, list_error, parameter, req, res) {
    var passwordData  = adminService.sha512(parameter.password, adminService.salt()),
        pr_user       = {
            user_id: 0,
            name: parameter.email,
            full_name: parameter.full_name ? parameter.full_name : '',
            password: passwordData.passwordHash,
            email: parameter.email,
            phone: parameter.phone,
            gender: parameter.gender ? parameter.gender : 2,
            birthday: parameter.birthday ? parameter.birthday.split("-").reverse().join("-") : "1990-08-31",
            address: parameter.address,
            activePasswordToken: "",
            resetPasswordExpires: new Date(Date.now() + 3600000),
            active: 0
        };

    return new Promise(function (resolve, reject) {
        try {
            if(list_error.email.length > 0 || 
                list_error.phone.length > 0 || 
                list_error.birthday.length > 0 ||
                list_error.password.length > 0 || 
                list_error.confirm_password.length > 0){
                resultData.error = list_error;
                res.send(resultData);
                return;
            }
            crypto.randomBytes(20, function (err, buf) {
                pr_user.activePasswordToken  = buf.toString('hex');
                userService.create(pr_user, function (err, reUser, fields) {
                    if (err) {
                        logService.create(req, err).then(function(responseData){
                            if(responseData.message) resultData.message = responseData.message;
                            else resultData.message = err.sqlMessage;
                            res.send(resultData);
                        });
                        return;
                    }
                    if (reUser.insertId !== undefined) {    
                        roleUserService.create({user_id: reUser.insertId, role_id: 2}, function (err, rsRole, fields) {
                            if (err) {
                                logService.create(req, err).then(function(responseData){
                                    if(responseData.message) resultData.message = responseData.message;
                                    else resultData.message = err.sqlMessage;
                                    res.send(resultData);
                                });
                                return;
                            }
                            var activeaccount = 'http://' + req.headers.host + '/user/activeaccount/' + pr_user.activePasswordToken;
                            mailService.mail_signup(parameter.email, activeaccount).then(function(success){
                                webService.addLogMail(JSON.stringify(success), JSON.stringify({email: parameter.email, link_active: activeaccount}), success.success ? 1 : 0, 0, 'mail_signup');
                                resultData.status  = true;
                                resultData.message = "Đăng ký thành công. Vui lòng kiểm tra email " + parameter.email + " để kích hoạt tài khoản theo hướng dẫn trước khi đăng nhập hệ thống!";
                                res.send(resultData);
                            });
                        })
                    } else {
                        resultData.message = "Dữ liệu trả về không xác định!";
                        res.send(resultData);
                    }
                });
            });
        } catch (error) {
            logService.create(req, error.message).then(function() {
                resultData.message = error.message;
                res.send(resultData);
            });
        }
    });
}

module.exports = router;
