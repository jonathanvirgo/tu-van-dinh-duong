var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    {IncomingForm}  = require("formidable"),
    returnUrl       = "/admin/height-by-weight",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    webService      = require('../../web/models/webModel'),
    modelService    = require('../models/heightByWeightModel'); 

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'height_by_weight')){
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
        if(!logService.authorizeAccess(req.user.role_id, 'height_by_weight')){
            throw new Error(notice_admin);
        }
        res.render(viewPage("create"), {
            user: req.user,
            height_bw: [],
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
        if(!logService.authorizeAccess(req.user.role_id, 'height_by_weight')){
            throw new Error(notice_admin);
        }
        modelService.getHeightByWeightById(req.params.id, function (err, result, fields) {
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
                height_bw: result[0],
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
        if(!logService.authorizeAccess(req.user.role_id, 'height_by_weight')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                height: isNaN(parseFloat(req.body.height)) ? '' : parseFloat(req.body.height).toFixed(1),
                gender: req.body.gender ? req.body.gender : null,
                weight_min: isNaN(parseFloat(req.body.weight)) ? '' : parseFloat(req.body.weight).toFixed(1),
                weight_max: isNaN(parseFloat(req.body.height)) ? '' : parseFloat(req.body.height).toFixed(1)
            };

        if(!parameter.gender){
            str_error.push("Thiếu giới tính!");
        }
        if(!parameter.weight_min){
            str_error.push("Thiếu cân nặng min!");
        }
        if(!parameter.weight_max){
            str_error.push("Thiếu cân nặng max!");
        }
        if(!parameter.height){
            str_error.push("Thiếu chiều cao!");
        }
        if(str_error.length > 0){
            res.render(viewPage("create"), {
                user: req.user,
                height_bw: parameter,
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
        if(!logService.authorizeAccess(req.user.role_id, 'height_by_weight')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                height: isNaN(parseFloat(req.body.height)) ? '' : parseFloat(req.body.height).toFixed(1),
                gender: req.body.gender ? req.body.gender : null,
                weight_min: isNaN(parseFloat(req.body.weight)) ? '' : parseFloat(req.body.weight).toFixed(1),
                weight_max: isNaN(parseFloat(req.body.height)) ? '' : parseFloat(req.body.height).toFixed(1)
            };

        if(!parameter.gender){
            str_error.push("Thiếu giới tính!");
        }
        if(!parameter.weight_min){
            str_error.push("Thiếu cân nặng min!");
        }
        if(!parameter.weight_max){
            str_error.push("Thiếu cân nặng max!");
        }
        if(!parameter.height){
            str_error.push("Thiếu chiều cao!");
        }
        if(str_error.length > 0){
            res.render(viewPage("edit"), {
                user: req.user,
                height_bw: parameter,
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
        if(!logService.authorizeAccess(req.user.role_id, 'height_by_weight')){
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
        if(!logService.authorizeAccess(req.user.role_id, 'height_by_weight')){
            throw new Error(notice_admin);
        }
        var arrPromise = [],
            parameter  = {
                skip: isNaN(parseInt(req.body.start)) ? 0 : parseInt(req.body.start),
                take: isNaN(parseInt(req.body.length)) ? 15 : parseInt(req.body.length),
                search_name: req.body.search_name,
                department_id: req.user.department_id,
                hospital_id: req.user.hospital_id,
                created_by: req.user.id,
                role_ids: req.user.role_id
            };

        resultMessage.draw = req.body.draw;
        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.countAllHeightByWeight(parameter, function (err, result, fields) {
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
            modelService.getAllHeightByWeight(parameter, function (err, result, fields) {
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

router.post('/import-from-excel', function (req, res, next) {
    var resultData = {
        success: false,
        message: "",
        data: ''
    };
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
            throw new Error(notice_admin);
        }
        var form    = new IncomingForm();
        form.parse(req, function(err, fields, files) {
            try {
                let dataWeightHeight = JSON.parse(fields.data);
                if(dataWeightHeight && dataWeightHeight.length > 0){
                    for(let item of dataWeightHeight){
                        let sqlWeightHeight = "SELECT * FROM height_by_weight WHERE height =  ? AND gender = ?";
                        webService.getListTable(sqlWeightHeight, [item.height, item.gender]).then(responseData =>{
                            if(responseData.success && responseData.data.length == 0){
                                webService.addRecordTable(item, 'height_by_weight', true);
                            }
                        });
                    }
                    resultData.success = true;
                }
                res.json(resultData);
            } catch (error) {
                resultData.message = typeof(error) == 'object' ? JSON.stringify(error) : error;
                res.json(resultData);
            }
        });
        
    } catch (e) {
        logService.create(req, e.message).then(function(){
            resultData.message = e.message;
            res.send(resultData);
        });
    }
});

function viewPage(name) {
    return path.resolve(__dirname, "../views/height_by_weight/" + name + ".ejs");
}

module.exports = router;