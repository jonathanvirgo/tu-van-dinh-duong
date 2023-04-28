var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    moment          = require('moment'),
    validator       = require("validator"),
    returnUrl       = "/admin/user",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    roleService     = require('./../models/roleModel'),
    roleUserService = require('./../models/roleUsersModel'),
    logService      = require('./../models/logModel'),
    adminService    = require('./../models/adminModel'),
    hospitalService = require('../models/hospitalModel'),
    modelService    = require('./../models/userModel'); 

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'user')){
            throw new Error(notice_admin);
        }
        var roles     = [],
            str_error = [];
        roleService.searchAllRole(function (err, result, fields) {
            if (err) {
                str_error.push(err.sqlMessage);
                logService.create(req, err);
            }
            if(result !== undefined){
                roles = result;
            }
            res.render(viewPage("list"), {
                user: req.user,
                roles: roles,
                role_id: [],
                errors: str_error
            });
        })
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.get('/create', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'user')){
            throw new Error(notice_admin);
        }
        let arrPromise = [],
            roles      = [],
            hospital   = [];
            
        arrPromise.push(new Promise(function (resolve, reject) {
            hospitalService.getAllHospital(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    hospital = result;
                }
                resolve();
            });
        }));
        arrPromise.push(new Promise(function (resolve, reject) {
            roleService.searchAllRole(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    roles = result;
                }
                resolve();
            });
        }));
        return new Promise((resolve, reject) => {
            Promise.all(arrPromise).then(function () {
                res.render(viewPage("create"), {
                    user: req.user,
                    roles: roles,
                    role_ids: [],
                    pr_user: [],
                    errors: [],
                    moment: moment,
                    hospital: hospital,
                    create_or_update : 1
                });
            });
        })
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.get('/edit/:id', function (req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'user')){
            throw new Error(notice_admin);
        }
        var str_error   = [],
            arrPromise  = [], 
            roles       = [],
            pr_user     = [],
            hospital    = [],
            role_ids    = [];

        arrPromise.push(new Promise(function (resolve, reject) {
            roleService.searchAllRole(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    roles = result;
                }
                resolve();
            });
        }));

        arrPromise.push(new Promise(function (resolve, reject) {
            roleUserService.getRoleByUserId(req.params.id, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    for (var i = 0; i < result.length; i++) {
                        role_ids.push(result[i].role_id);
                    }
                }
                resolve();
            });
        }));

        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.getUserById(req.params.id, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    pr_user = result[0];
                }
                resolve();
            });
        }));
        arrPromise.push(new Promise(function (resolve, reject) {
            hospitalService.getAllHospital(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    hospital = result;
                }
                resolve();
            });
        }));
        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                if (pr_user) {
                    res.render(viewPage("edit"), {
                        user: req.user,
                        roles: roles,
                        role_ids: role_ids,
                        pr_user: pr_user,
                        moment: moment,
                        errors: str_error,
                        create_or_update : 0,
                        hospital: hospital
                    });
                } else {
                    adminService.addToLog(req, res, 'Không tìm thấy user có user_id=' + req.params.id);
                }
            });
        });
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

function validatorUser(req, parameter, selected_role_ids, userId = 0){
    var str_error = [],
       arrPromise = [];

    if(parameter.name == ''){
        str_error.push("Tên đăng nhập được yêu cầu!");
    } else {
        if (!validator.matches(parameter.name, "^[a-zA-Z0-9_@\.\-]*$")) {
            str_error.push('Tên truy cập của bạn không hợp lệ!');
        } else {
            if(!parameter.isUpdate){
                arrPromise.push(new Promise(function (resolve, reject) {
                    modelService.countUserByName({name: parameter.name, user_id: userId}, function (err, result, fields) {
                        if (err) {
                            return logService.create(req, err).then(function(responseData){
                                if(responseData.message) str_error.push(responseData.message);
                                else str_error.push(err.sqlMessage);
                                resolve();
                            });
                        }
                        if (result !== undefined) {
                            if(result[0].count > 0){
                                str_error.push('Tên truy cập của bạn đã được sử dụng!');
                            }
                        }
                        resolve();
                    })
                }));
            }
        }
    }
    if(parameter.email == ''){
        str_error.push("Email được yêu cầu!");
    } else {
        if(!validator.isEmail(req.body.email)){
            str_error.push('Email bạn sử dụng không hợp lệ!');
        } else {
            if(!parameter.isUpdate){
                arrPromise.push(new Promise(function (resolve, reject) {
                    modelService.countUserByEmail({name: parameter.email, user_id: userId}, function (err, result, fields) {
                        if (err) {
                            return logService.create(req, err).then(function(responseData){
                                if(responseData.message) str_error.push(responseData.message);
                                else str_error.push(err.sqlMessage);
                                resolve();
                            });
                        }
                        if (result !== undefined) {
                            if(result[0].count > 0){
                                str_error.push('Tài khoản email của bạn đã được sử dụng!');
                            }
                        }
                        resolve();
                    })
                }));
            }
        }
    }
    if(userId == 0 && parameter.password == ''){
        str_error.push("Mật khẩu được yêu cầu!");
    }
    if(selected_role_ids.length == 0){
        str_error.push("Quyền người dùng được yêu cầu!");
    }
    return new Promise(function (resolve, reject) {
        Promise.all(arrPromise).then(function () {
            resolve(str_error);
        })
    })
}

router.post('/create', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'user')){
            throw new Error(notice_admin);
        }
        var role_ids          = [],
            roles             = [],
            arrPromise        = [],
            roleUserPromise   = [],
            passwordData      = adminService.sha512(req.body.password, adminService.salt()),
            selected_role_ids = req.body.selected_role_ids != undefined ? req.body.selected_role_ids : [],
            btn_action        = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter         = {
                name: req.body.name,
                full_name: req.body.full_name,
                password: req.body.password,
                email: req.body.email,
                phone: req.body.phone,
                gender: req.body.gender == "male" ? 0 : 1,
                birthday: adminService.parseDay(req.body.birthday),
                hospital_id: req.body.hospital_id,
                department_id: req.body.department_id,
                address: req.body.address,
                activePasswordToken: "",
                resetPasswordExpires: new Date(Date.now() + 3600000),
                active: req.body.active ? (req.body.active == 'on' ? 1 : 0) : 0, 
                isUpdate: false
            };
        
        arrPromise.push(new Promise(function (resolve, reject) {
            roleService.searchAllRole(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        resolve();
                    });
                }
                if(result !== undefined){
                    roles = result;
                }
                resolve();
            })
        }));
      
        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                if(parameter.password != ''){
                    parameter.password = passwordData.passwordHash;
                }
                
                if(selected_role_ids.length > 0){
                    for (var i = 0; i < selected_role_ids.length; i++) {
                        var selected_id = isNaN(parseInt(selected_role_ids[i])) ? 0 : parseInt(selected_role_ids[i]);
                        if(selected_id > 0){
                            role_ids.push(selected_id);
                        }
                    }
                }
                validatorUser(req, parameter, selected_role_ids, 0).then(function(str_error){
                    if(str_error.length > 0){
                        res.render(viewPage("create"), {
                            user: req.user,
                            roles: roles,
                            role_ids: role_ids,
                            pr_user: parameter,
                            errors: str_error,
                            moment: moment,
                            create_or_update : 1
                        });
                    } else {
                        modelService.create(parameter, function (err, reUser, fields) {
                            if (err) {
                                adminService.addToLog(req, res, err);
                                return;
                            }
                            if (reUser.insertId !== undefined) {
                                for (var i = 0; i < role_ids.length; i++) {
                                    var itemRole = { 
                                        role_id: role_ids[i], 
                                        user_id: reUser.insertId 
                                    }
                                    roleUserPromise.push(new Promise(function (resolve, reject) {
                                        roleUserService.create(itemRole, function (err, rsRole, fields) {
                                            if (err) {
                                                return logService.create(req, err).then(function(responseData){
                                                    resolve();
                                                });
                                            }
                                            resolve();
                                        })
                                    }));
                                }
                                return new Promise(function (resolve, reject) {
                                    Promise.all(roleUserPromise).then(function () {
                                        if (btn_action == "save") {
                                            res.redirect(returnUrl);
                                        } else {
                                            res.redirect(returnUrl + '/edit/' + reUser.insertId);
                                        }
                                    });
                                });
                            } else {
                                adminService.addToLog(req, res, 'Dữ liệu trả về không xác định!');
                            }
                        })
                    }
                });
            })
        });
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.post('/edit/:id', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'user')){
            throw new Error(notice_admin);
        }
        var pr_user           = [],
            role_ids          = [],
            roles             = [],
            arrPromise        = [],
            hospital          = [],
            roleUserPromise   = [],
            passwordData      = adminService.sha512(req.body.password, adminService.salt()),
            selected_role_ids = req.body.selected_role_ids != undefined ? req.body.selected_role_ids : [],
            btn_action        = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter         = {
                id: parseInt(req.params.id),
                name: req.body.name,
                full_name: req.body.full_name,
                password: req.body.password,
                email: req.body.email,
                phone: req.body.phone,
                gender: req.body.gender == "male" ? 0 : 1,
                birthday: adminService.parseDay(req.body.birthday),
                address: req.body.address,
                department_id: req.body.department_id,
                hospital_id: req.body.hospital_id,
                active: req.body.active ? (req.body.active == 'on' ? 1 : 0) : 0, 
                isUpdate: true
            };
        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.getUserById(parameter.id, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        resolve();
                    });
                }
                pr_user = result[0];
                resolve();
            });
        }));

        arrPromise.push(new Promise(function (resolve, reject) {
            roleService.searchAllRole(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        resolve();
                    });
                }
                if(result !== undefined){
                    roles = result;
                }
                resolve();
            })
        }));
        arrPromise.push(new Promise(function (resolve, reject) {
            hospitalService.getAllHospital(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    hospital = result;
                }
                resolve();
            });
        }));
        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                if(pr_user == undefined){
                    adminService.addToLog(req, res, 'Không tìm thấy thông tin người dùng');
                } else {
                    if(parameter.password != ''){
                        parameter.password = passwordData.passwordHash;
                    }
                        
                    if(selected_role_ids.length > 0){
                        for (var i = 0; i < selected_role_ids.length; i++) {
                            var selected_id = isNaN(parseInt(selected_role_ids[i])) ? 0 : parseInt(selected_role_ids[i]);
                            if(selected_id > 0){
                                role_ids.push(selected_id);
                            }
                        }
                    }
                    validatorUser(req, parameter, selected_role_ids, parameter.id).then(function(str_error){
                        if(str_error.length > 0){
                            res.render(viewPage("edit"), {
                                user: req.user,
                                roles: roles,
                                role_ids: role_ids,
                                pr_user: parameter,
                                errors: str_error,
                                hospital: hospital,
                                moment: moment,
                                create_or_update : 0
                            });
                        } else {
                            roleUserPromise.push(new Promise(function (resolve, reject) {
                                modelService.update(parameter, function (err, result, fields) {
                                    if (err) {
                                        return logService.create(req, err).then(function(responseData){
                                            resolve();
                                        });
                                    }
                                    resolve();
                                })
                            }));
                            roleUserPromise.push(new Promise(function (resolve, reject) {
                                roleUserService.delete(parameter.id, function (err, result, fields) {
                                    if (err) {
                                        return logService.create(req, err).then(function(responseData){
                                            resolve();
                                        });
                                    }
                                    resolve();
                                })
                            }));

                            
                            return new Promise(function (resolve, reject) {
                                Promise.all(roleUserPromise).then(function () {
                                    var addRolePromise = [];
                                    for (var i = 0; i < role_ids.length; i++) {
                                        var itemRole = { 
                                                role_id: role_ids[i], 
                                                user_id: parameter.id 
                                            }

                                        addRolePromise.push(new Promise(function (resolve, reject) {
                                            roleUserService.create(itemRole, function (err, result, fields) {
                                                if (err) {
                                                    return logService.create(req, err).then(function(responseData){
                                                        resolve();
                                                    });
                                                }
                                                resolve();
                                            })
                                        }));
                                    }
                                    return new Promise(function (resolve, reject) {
                                        Promise.all(addRolePromise).then(function () {
                                            if (btn_action == "save") {
                                                res.redirect(returnUrl);
                                            } else {
                                                res.redirect(returnUrl + '/edit/' + parameter.id);
                                            }
                                        })
                                    })
                                });
                            });
                        }
                    })
                }
            })
        })
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.post('/list', function (req, res, next) {
    var resultMessage = {
        "data": [],
        "error": "",
        "draw": "1",
        "recordsFiltered": 0,
        "recordsTotal": 0
    };
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'user')){
            throw new Error(notice_admin);
        }
        var users      = [],
            arrPromise = [],
            parameter  = {
                skip: isNaN(parseInt(req.body.start)) ? 0 : parseInt(req.body.start),
                take: isNaN(parseInt(req.body.length)) ? 15 : parseInt(req.body.length),
                search_name: req.body.search_name,
                search_email: req.body.search_email,
                search_active: req.body.search_active,
                search_role_ids: req.body.search_role_ids,
                role_ids: req.user.role_id
            };

        resultMessage.draw = req.body.draw;
        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.countAllUser(parameter, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) resultMessage.error = responseData.message;
                        else resultMessage.error = err.sqlMessage;
                        resolve();
                    });
                }
                if (result !== undefined) {
                    resultMessage.recordsTotal    = result[0].count;
                    resultMessage.recordsFiltered = result[0].count;
                }
                resolve();
            });
        }));

        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.getAllUser(parameter, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) resultMessage.error = responseData.message;
                        else resultMessage.error = err.sqlMessage;
                        resolve();
                    });
                }
                if (result !== undefined) {
                    for (var i = 0; i < result.length; i++) {
                        role_index = users.findIndex(x => x.id == result[i].id);
                        if(role_index == -1){
                            users.push(result[i]);
                        } else {
                            users[role_index].role_name += ', ' + result[i].role_name;
                        }
                    }
                    resultMessage.data = users;
                }
                resolve();
            });
        }));

        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                res.send(resultMessage);
            });
        });
    } catch (e) {
        logService.create(req, e.message).then(function(){
            resultMessage.error = e.message;
            res.send(resultMessage);
        });
    }
});

function viewPage(name) {
    return path.resolve(__dirname, "../views/user/" + name + ".ejs");
}

module.exports = router;