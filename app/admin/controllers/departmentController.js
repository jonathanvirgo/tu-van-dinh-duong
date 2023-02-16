var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    returnUrl       = "/admin/department",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    modelService    = require('../models/departmentModel'),
    hospitalService = require('../models/hospitalModel'); 

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        res.render(viewPage("list"), { 
            user: req.user 
        });
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.get('/create', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        hospitalService.getAllHospital(function (err, result, fields) {
            if (err) {
                adminService.addToLog(req, res, err);
                return;
            }
            res.render(viewPage("create"), {
                user: req.user,
                department: [],
                hospital:result,
                errors: []
            });
         });
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.get('/edit/:id', function (req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        let arrPromise = [],
            hospital   = [],
            department = {};

        arrPromise.push(new Promise(function (resolve, reject) {
            hospitalService.getAllHospital(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(log_id){
                        str_error.push(err.sqlMessage);
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
            modelService.getDepartmentById(req.params.id, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(log_id){
                        str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result[0] !== undefined) {
                    department = result[0]
                }
                resolve();
            });
        }));

        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                if (department) {
                    res.render(viewPage("edit"), {
                        user: req.user,
                        department: result[0],
                        hospital:[],
                        errors: []
                    });
                } else {
                    adminService.addToLog(req, res, 'Không tìm thấy khoa nào có id=' + req.params.id);
                }
            });
        });
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.post('/create', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                name: req.body.department_name,
                hospital_id: req.body.hospital_id ? req.body.hospital_id : null,
                phone: req.body.department_phone ? req.body.department_phone : ''
            };
            
        if(parameter.name == ''){
            str_error.push("Thiếu tên khoa!");
        }
        if(!parameter.hospital_id){
            str_error.push("Chưa chọn bệnh viện!");
        }
        if(str_error.length > 0){
            res.render(viewPage("create"), {
                user: req.user,
                department: parameter,
                hospital:[],
                errors: str_error
            });
        } else {
            modelService.create(parameter, function (err, results, fields) {
                if (err) {
                    adminService.addToLog(req, res, err);
                    return;
                }
                if (results.insertId !== undefined) {
                    if (btn_action == "save") {
                        res.redirect(returnUrl);
                    } else {
                        res.redirect(returnUrl + '/edit/' + results.insertId);
                    }
                } else {
                    adminService.addToLog(req, res, 'Dữ liệu trả về không xác định!');
                }
            })
        }
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.post('/edit/:id', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                id: parseInt(req.params.id),
                name: req.body.department_name,
                hospital_id: req.body.hospital_id ? req.body.hospital_id : null,
                phone: req.body.department_phone ? req.body.department_phone : ''
            };
            
        if(parameter.name == ''){
            str_error.push("Thiếu tên bệnh viện!");
        }
        if(!parameter.hospital_id){
            str_error.push("Chưa chọn bệnh viện!");
        }
        if(str_error.length > 0){
            res.render(viewPage("edit"), {
                user: req.user,
                department: parameter,
                hospital:[],
                errors: str_error
            });
        } else {
            modelService.update(parameter, function (err, results, fields) {
                if (err) {
                    adminService.addToLog(req, res, err);
                    return;
                }
                if (results !== undefined) {
                    if (btn_action == "save") {
                        res.redirect(returnUrl);
                    } else {
                        res.redirect(returnUrl + '/edit/' + parameter.role_id);
                    }
                } else {
                    adminService.addToLog(req, res, 'Dữ liệu trả về không xác định!');
                }
            });
        }
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.post('/delete/:id', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        var record_id = isNaN(parseInt(req.params.id)) ? 0 : parseInt(req.params.id);
        modelService.delete(record_id, function (err, results, fields) {
            if (err) {
                adminService.addToLog(req, res, err);
                return;
            }
            var affectedRow = isNaN(parseInt(results.affectedRows)) ? 0 : parseInt(results.affectedRows);
            if(affectedRow > 0){
                res.redirect(returnUrl); 
            } else {
                adminService.addToLog(req, res, 'Không tìm thấy role có role_id=' + req.params.id);
            }
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
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        var arrPromise = [],
            parameter  = {
                skip: isNaN(parseInt(req.body.start)) ? 0 : parseInt(req.body.start),
                take: isNaN(parseInt(req.body.length)) ? 15 : parseInt(req.body.length),
                search_name: req.body.search_name,
                search_value: req.body.search_value
            };

        resultMessage.draw = req.body.draw;
        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.countAllDepartment(parameter, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(){
                        resultMessage.error = err.sqlMessage;
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
            modelService.getAllDepartment(parameter, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(){
                        resultMessage.error = err.sqlMessage;
                        resolve();
                    });
                }
                if (result !== undefined) {
                    resultMessage.data = result;
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
    return path.resolve(__dirname, "../views/department/" + name + ".ejs");
}

module.exports = router;