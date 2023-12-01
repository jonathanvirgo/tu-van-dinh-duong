var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    returnUrl       = "/admin/medicine",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    modelService    = require('../models/medicineModel'),
    webService      = require('../../web/models/webModel');

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'medicine')){
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine')){
            throw new Error(notice_admin);
        }
        // Phân loại thuốc
        let sqlmedicineTypeList = 'SELECT * FROM medicine_type WHERE id > 0';
        let sqlmedicineTypePermit = webService.addPermitTable(sqlmedicineTypeList, req.user);
        webService.getListTable(sqlmedicineTypePermit.sqlQuery, sqlmedicineTypePermit.paramSql).then(responseData6 =>{
            let medicineType = [];
            let errors = [];
            if(responseData6.success){
                if(responseData6.data && responseData6.data.length > 0){
                    medicineType = responseData6.data;
                }
            }else{
                errors.push(responseData6.message);
            }
            res.render(viewPage("create"), {
                user: req.user,
                medicine: [],
                errors: errors,
                medicineType: medicineType
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine')){
            throw new Error(notice_admin);
        }
        let arrPromise = [];
        let errors = [];
        let medicine = {};
        let medicineType = [];
        arrPromise.push(
            new Promise((resolve, reject) => {
                modelService.getMedicineById(req.params.id, function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(responseData){
                            if(responseData.message) errors.push(responseData.message);
                            else errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    if(result[0] !== undefined){
                        medicine = result[0];
                    }
                    resolve();
            })
        }));
        // Phân loại thuốc
        let sqlmedicineTypeList = 'SELECT * FROM medicine_type WHERE id > 0';
        let sqlmedicineTypePermit = webService.addPermitTable(sqlmedicineTypeList, req.user);
        arrPromise.push(webService.getListTable(sqlmedicineTypePermit.sqlQuery, sqlmedicineTypePermit.paramSql).then(responseData6 =>{
            if(responseData6.success){
                if(responseData6.data && responseData6.data.length > 0){
                    medicineType = responseData6.data;
                }
            }else{
                errors.push(responseData6.message);
            }
        }));
        Promise.all(arrPromise).then(function(){
            if(medicine){
                res.render(viewPage("edit"), {
                    user: req.user,
                    medicine: medicine,
                    errors: errors,
                    medicineType: medicineType
                });
            }else{
                adminService.addToLog(req, res, 'Không tìm thấy thuốc nào có id=' + req.params.id);
            }
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                name: req.body.name,
                unit: req.body.unit,
                description: req.body.description,
                share: req.body.share ? (req.body.share == 'on' ? 1 : 0) : 0,
                type: isNaN(parseInt(req.body.type_id)) ? 0 : parseInt(req.body.type_id),
                department_id: req.user.department_id,
                hospital_id: req.user.hospital_id,
                created_by: req.user.id
            };
            
        if(parameter.name == ''){
            str_error.push("Thiếu tên thuốc!");
        }
        if(parameter.unit == ''){
            str_error.push("Thiếu đơn vị tính!");
        }
        if(str_error.length > 0){
            res.render(viewPage("create"), {
                user: req.user,
                medicine: parameter,
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                id: parseInt(req.params.id),
                name: req.body.name,
                unit: req.body.unit,
                description: req.body.description,
                share: req.body.share ? (req.body.share == 'on' ? 1 : 0) : 0,
                type: isNaN(parseInt(req.body.type_id)) ? 0 : parseInt(req.body.type_id),
                department_id: req.user.department_id,
                hospital_id: req.user.hospital_id,
                created_by: req.user.id
            };
            
        if(parameter.name == ''){
            str_error.push("Thiếu tên thuốc!");
        }
        if(parameter.unit == ''){
            str_error.push("Thiếu đơn vị tính!");
        }
        if(str_error.length > 0){
            res.render(viewPage("edit"), {
                user: req.user,
                medicine: parameter,
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine')){
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
                adminService.addToLog(req, res, 'Không tìm thấy thuốc nào có id=' + req.params.id);
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine')){
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
            modelService.countAllMedicine(parameter, function (err, result, fields) {
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
            modelService.getAllMedicine(parameter, function (err, result, fields) {
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
    return path.resolve(__dirname, "../views/medicine/" + name + ".ejs");
}

module.exports = router;