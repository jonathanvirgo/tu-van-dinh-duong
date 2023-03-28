var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    returnUrl       = "/admin/nutrition-advice",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    modelService    = require('../models/nutritionAdviceModel'); 

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if (!req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
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
        if (!req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
            throw new Error(notice_admin);
        }
        res.render(viewPage("create"), {
            user: req.user,
            nutritionAdvice: [],
            errors: []
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
        if (!req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
            throw new Error(notice_admin);
        }
        modelService.getNutritionAdviceById(req.params.id, function (err, result, fields) {
            if (err) {
                adminService.addToLog(req, res, err);
                return;
            }
            if(result[0] == undefined){
                adminService.addToLog(req, res, 'Không tìm thấy lời khuyên nào có id=' + req.params.id);
                return;
            }
            res.render(viewPage("edit"), {
                user: req.user,
                nutritionAdvice: result[0],
                errors: []
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
        if (!req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                name: req.body.name,
                glucid_should_use: req.body.glucid_should_use,
                glucid_limited_use: req.body.glucid_limited_use,
                glucid_should_not_use: req.body.glucid_should_not_use,
                protein_should_use: req.body.protein_should_use,
                protein_limited_use: req.body.protein_limited_use,
                protein_should_not_use: req.body.protein_should_not_use,
                lipid_should_use: req.body.lipid_should_use,
                lipid_limited_use: req.body.lipid_limited_use,
                lipid_should_not_use: req.body.lipid_should_not_use,
                vitamin_ck_should_use: req.body.vitamin_ck_should_use,
                vitamin_ck_limited_use: req.body.vitamin_ck_limited_use,
                vitamin_ck_should_not_use: req.body.vitamin_ck_should_not_use,
                department_id: req.user.department_id,
                hospital_id: req.user.hospital_id,
                created_by: req.user.id
            };
            
        if(parameter.name == ''){
            str_error.push("Thiếu tên lời khuyên!");
        }
        if(str_error.length > 0){
            res.render(viewPage("create"), {
                user: req.user,
                nutritionAdvice: parameter,
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
        if (!req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                id: parseInt(req.params.id),
                name: req.body.name,
                glucid_should_use: req.body.glucid_should_use,
                glucid_limited_use: req.body.glucid_limited_use,
                glucid_should_not_use: req.body.glucid_should_not_use,
                protein_should_use: req.body.protein_should_use,
                protein_limited_use: req.body.protein_limited_use,
                protein_should_not_use: req.body.protein_should_not_use,
                lipid_should_use: req.body.lipid_should_use,
                lipid_limited_use: req.body.lipid_limited_use,
                lipid_should_not_use: req.body.lipid_should_not_use,
                vitamin_ck_should_use: req.body.vitamin_ck_should_use,
                vitamin_ck_limited_use: req.body.vitamin_ck_limited_use,
                vitamin_ck_should_not_use: req.body.vitamin_ck_should_not_use,
                department_id: req.user.department_id,
                hospital_id: req.user.hospital_id,
                created_by: req.user.id
            };
            
        if(parameter.name == ''){
            str_error.push("Thiếu tên lời khuyên!");
        }
        if(str_error.length > 0){
            res.render(viewPage("edit"), {
                user: req.user,
                nutritionAdvice: parameter,
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
                        res.redirect(returnUrl + '/edit/' + parameter.id);
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
        if (!req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
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
                adminService.addToLog(req, res, 'Không tìm thấy lời khuyên có id=' + req.params.id);
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
        if (!req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
            throw new Error(notice_admin);
        }
        var arrPromise = [],
            parameter  = {
                skip: isNaN(parseInt(req.body.start)) ? 0 : parseInt(req.body.start),
                take: isNaN(parseInt(req.body.length)) ? 15 : parseInt(req.body.length),
                search_name: req.body.search_name,
                search_value: req.body.search_value,
                department_id: req.user.department_id,
                hospital_id: req.user.hospital_id,
                created_by: req.user.id,
                role_ids: req.user.role_id
            };

        resultMessage.draw = req.body.draw;
        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.countAllNutritionAdvice(parameter, function (err, result, fields) {
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
            modelService.getAllNutritionAdvice(parameter, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) resultMessage.error = responseData.message;
                        else resultMessage.error = err.sqlMessage;
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
    return path.resolve(__dirname, "../views/nutrition_advice/" + name + ".ejs");
}

module.exports = router;