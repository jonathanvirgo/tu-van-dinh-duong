var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    returnUrl       = "/admin/medicine-type",
    table           = 'medicine_type',
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    modelService    = require('../models/medicineTypeModel'),
    webService      = require('../../web/models/webModel');

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'medicine-type')){
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine-type')){
            throw new Error(notice_admin);
        }
        res.render(viewPage("create"), {
            user: req.user,
            medicineType: [],
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine-type')){
            throw new Error(notice_admin);
        }
        webService.getListTable(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]).then(responseData =>{
            if(responseData.success){
                if(responseData.data && responseData.data.length > 0){
                    res.render(viewPage("edit"), {
                        user: req.user,
                        medicineType: responseData.data[0],
                        errors: []
                    });
                }else{
                    adminService.addToLog(req, res, responseData.message);
                }
            }else{
                adminService.addToLog(req, res, responseData.message);
            }
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine-type')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                name: req.body.name,
                share: req.body.share ? (req.body.share == 'on' ? 1 : 0) : 0,
                department_id: req.user.department_id,
                hospital_id: req.user.hospital_id,
                created_by: req.user.id
            };
            
        if(parameter.name == ''){
            str_error.push("Thiếu tên phân loại!");
        }
        
        if(str_error.length > 0){
            res.render(viewPage("create"), {
                user: req.user,
                medicineType: parameter,
                errors: str_error
            });
        } else {
            webService.addRecordTable(parameter,table, true).then(responseData =>{
                if(responseData.success){
                    if (responseData.data.insertId !== undefined) {
                        if (btn_action == "save") {
                            res.redirect(returnUrl);
                        } else {
                            res.redirect(returnUrl + '/edit/' + results.insertId);
                        }
                    }else{
                        adminService.addToLog(req, res, util.inspect(responseData.data));
                    }
                }else{
                    adminService.addToLog(req, res, responseData.message);
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine-type')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                name: req.body.name ? req.body.name : ''
            };
        if(req.body.share){
            parameter['share'] = req.body.share == 'on' ? 1 : 0;
        }
        let id = isNaN(parseInt(req.params.id)) ? 0 : parseInt(req.params.id);
        if(!parameter.name){
            str_error.push("Thiếu tên phân loại!");
        }
        if(!id){
            str_error.push("Thiếu id phân loại!");
        }
        if(str_error.length > 0){
            res.render(viewPage("edit"), {
                user: req.user,
                medicine: parameter,
                errors: str_error
            });
        } else {
            webService.updateRecordTable(parameter, {id: id}, table).then(responseData =>{
                if(responseData.success){
                    if(responseData.data){
                        if (btn_action == "save") {
                            res.redirect(returnUrl);
                        } else {
                            res.redirect(returnUrl + '/edit/' + id);
                        }
                    }
                }else{
                    adminService.addToLog(req, res, responseData.message);
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine-type')){
            throw new Error(notice_admin);
        }
        var record_id = isNaN(parseInt(req.params.id)) ? 0 : parseInt(req.params.id);
        if(!record_id) adminService.addToLog(req, res, 'Thiếu Id phân loại');
        webService.deleteRecordTable({id: record_id}, table).then(responseData =>{
            if(responseData.success){
                var affectedRow = isNaN(parseInt(responseData.data.affectedRows)) ? 0 : parseInt(responseData.data.affectedRows);
                if(affectedRow > 0){
                    res.redirect(returnUrl); 
                } else {
                    adminService.addToLog(req, res, 'Không tìm thấy phân loại nào có id=' + record_id);
                }
            }else{
                adminService.addToLog(req, res, responseData.message);
            }
        });
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
        if(!logService.authorizeAccess(req.user.role_id, 'medicine-type')){
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
            modelService.countAllMedicineType(parameter, function (err, result, fields) {
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
            modelService.getAllMedicineType(parameter, function (err, result, fields) {
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
    return path.resolve(__dirname, "../views/medicine_type/" + name + ".ejs");
}

module.exports = router;