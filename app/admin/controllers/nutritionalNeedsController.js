var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    {IncomingForm}  = require("formidable"),
    returnUrl       = "/admin/nutritional-needs",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    webService      = require('../../web/models/webModel'),
    modelService    = require('../models/nutritionalNeedsModel'); 

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'nutritional-needs')){
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
        if(!logService.authorizeAccess(req.user.role_id, 'nutritional-needs')){
            throw new Error(notice_admin);
        }
        res.render(viewPage("create"), {
            user: req.user,
            nutritionalNeed: [],
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
        if(!logService.authorizeAccess(req.user.role_id, 'nutritional-needs')){
            throw new Error(notice_admin);
        }
        modelService.getnutritionalNeedsById(req.params.id, function (err, result, fields) {
            if (err) {
                adminService.addToLog(req, res, err);
                return;
            }
            if(result[0] == undefined){
                adminService.addToLog(req, res, 'Không tìm thấy bệnh viện nào có id=' + req.params.id);
                return;
            }
            res.render(viewPage("edit"), {
                user: req.user,
                nutritionalNeed: result[0],
                errors: []
            });
        })
    } catch (e) {
        adminService.addToLog(req, res, e.message);
    }
});

router.post('/create', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'nutritional-needs')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                age_min: isNaN(parseFloat(req.body.age_min)) ? '' : parseFloat(req.body.age_min).toFixed(2),
                age_max: isNaN(parseFloat(req.body.age_max)) ? '' : parseFloat(req.body.age_max).toFixed(2),
                gender: req.body.gender ? req.body.gender : null,
                content: req.body.content ? req.body.content : '' 
                
            };
            
        if(parameter.age_min == ''){
            str_error.push("Thiếu age min!");
        }
        if(!parameter.gender){
            str_error.push("Thiếu giới tính!");
        }
        if(!parameter.content){
            str_error.push("Thiếu content!");
        }
        if(str_error.length > 0){
            res.render(viewPage("create"), {
                user: req.user,
                standard_wh: parameter,
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
        if(!logService.authorizeAccess(req.user.role_id, 'nutritional-needs')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                id: parseInt(req.params.id),
                year_old: isNaN(parseFloat(req.user.year_old)) ? '' : parseFloat(req.user.year_old).toFixed(2),
                type_year_old: req.body.type_year_old ? req.body.type_year_old : null,
                gender: req.user.gender ? req.user.gender : null,
                weight: isNaN(parseFloat(req.user.weight)) ? '' : parseFloat(req.user.weight).toFixed(2),
                height: isNaN(parseFloat(req.user.height)) ? '' : parseFloat(req.user.height).toFixed(2)
            };
            
        if(parameter.year_old == ''){
            str_error.push("Thiếu tuổi!");
        }
        if(!parameter.type_year_old){
            str_error.push("Thiếu loại tuổi!");
        }
        if(!parameter.gender){
            str_error.push("Thiếu giới tính!");
        }
        if(!parameter.weight){
            str_error.push("Thiếu cân nặng!");
        }
        if(!parameter.height){
            str_error.push("Thiếu chiều cao!");
        }
        if(str_error.length > 0){
            res.render(viewPage("edit"), {
                user: req.user,
                standard_wh: parameter,
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
        if(!logService.authorizeAccess(req.user.role_id, 'nutritional-needs')){
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
                adminService.addToLog(req, res, 'Không tìm thấy cân nặng chiều cao tiêu chuẩn nào có id=' + req.params.id);
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
        if(!logService.authorizeAccess(req.user.role_id, 'nutritional-needs')){
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
            modelService.countAllnutritionalNeeds(parameter, function (err, result, fields) {
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
            modelService.getAllnutritionalNeeds(parameter, function (err, result, fields) {
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
    return path.resolve(__dirname, "../views/nutritional_needs/" + name + ".ejs");
}

module.exports = router;