var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    {IncomingForm}  = require("formidable"),
    returnUrl       = "/admin/food-info",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    modelService    = require('../models/foodInfoModel'),
    foodTypeService = require('../models/foodTypeModel'),
    webService      = require('../../web/models/webModel'); 

router.get('/', function (req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
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
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
            throw new Error(notice_admin);
        }
        foodTypeService.getAllFoodType(req.user, function (err, result, fields) {
            if (err) {
                adminService.addToLog(req, res, err);
                return;
            }
            res.render(viewPage("create"), {
                user: req.user,
                foodInfo: [],
                foodType:result,
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
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
            throw new Error(notice_admin);
        }
        let arrPromise = [],
            foodType   = [],
            foodInfo = {};

        arrPromise.push(new Promise(function (resolve, reject) {
            foodTypeService.getAllFoodType(req.user, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result !== undefined) {
                    foodType = result;
                }
                resolve();
            });
        }));
        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.getFoodInfoById(req.params.id, function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(responseData){
                        if(responseData.message) str_error.push(responseData.message);
                        else str_error.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result[0] !== undefined) {
                    foodInfo = result[0];
                }
                resolve();
            });
        }));

        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                if (foodInfo) {
                    res.render(viewPage("edit"), {
                        user: req.user,
                        foodInfo: foodInfo,
                        foodType:foodType,
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
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                name: req.body.name,
                food_type_id: req.body.food_type_id ? req.body.food_type_id : null,
                weight: isNaN(parseInt(req.body.weight)) ? null : req.body.weight,
                energy: isNaN(parseInt(req.body.energy)) ? null : req.body.energy,
                protein: isNaN(parseFloat(req.body.protein)) ? null : req.body.protein,
                animal_protein: isNaN(parseFloat(req.body.animal_protein)) ? null : req.body.animal_protein,
                lipid: isNaN(parseFloat(req.body.lipid)) ? null : req.body.lipid,
                unanimal_lipid: isNaN(parseFloat(req.body.unanimal_lipid)) ? null : req.body.unanimal_lipid,
                carbohydrate: isNaN(parseFloat(req.body.carbohydrate)) ? null : req.body.carbohydrate,
                hospital_id: req.user.hospital_id,
                department_id: req.user.department_id,
                created_by: req.user.id 
            };
        if(parameter.name == ''){
            str_error.push("Thiếu tên thực phẩm!");
        }
        if(!parameter.food_type_id){
            str_error.push("Chưa chọn loại thực phẩm!");
        }
        if(!parameter.weight){
            str_error.push("Thiếu khối lượng thực phẩm!");
        }
        if(str_error.length > 0){
            res.render(viewPage("create"), {
                user: req.user,
                foodInfo: parameter,
                foodType:[],
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
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
            throw new Error(notice_admin);
        }
        var str_error  = [],
            btn_action = req.body.save != undefined ? req.body.save : req.body.saveContinue,
            parameter  = {
                id: parseInt(req.params.id),
                name: req.body.name,
                food_type_id: req.body.food_type_id ? req.body.food_type_id : null,
                weight: isNaN(parseInt(req.body.weight)) ? null : req.body.weight,
                energy: isNaN(parseInt(req.body.energy)) ? null : req.body.energy,
                protein: isNaN(parseFloat(req.body.protein)) ? null : req.body.protein,
                animal_protein: isNaN(parseFloat(req.body.animal_protein)) ? null : req.body.animal_protein,
                lipid: isNaN(parseFloat(req.body.lipid)) ? null : req.body.lipid,
                unanimal_lipid: isNaN(parseFloat(req.body.unanimal_lipid)) ? null : req.body.unanimal_lipid,
                carbohydrate: isNaN(parseFloat(req.body.carbohydrate)) ? null : req.body.carbohydrate,
                hospital_id: req.user.hospital_id,
                department_id: req.user.department_id,
                created_by: req.user.id 
            };
            if(parameter.name == ''){
                str_error.push("Thiếu tên thực phẩm!");
            }
            if(!parameter.food_type_id){
                str_error.push("Chưa chọn loại thực phẩm!");
            }
            if(!parameter.weight){
                str_error.push("Thiếu khối lượng thực phẩm!");
            }
        if(str_error.length > 0){
            res.render(viewPage("edit"), {
                user: req.user,
                foodInfo: parameter,
                foodType:[],
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
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
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
        if(!logService.authorizeAccess(req.user.role_id, 'food-info')){
            throw new Error(notice_admin);
        }
        var arrPromise = [],
            parameter  = {
                skip: isNaN(parseInt(req.body.start)) ? 0 : parseInt(req.body.start),
                take: isNaN(parseInt(req.body.length)) ? 15 : parseInt(req.body.length),
                search_name: req.body.search_name,
                search_value: req.body.search_value,
                hospital_id: req.user.hospital_id,
                department_id: req.user.department_id,
                created_by: req.user.id,
                role_ids: req.user.role_id
            };

        resultMessage.draw = req.body.draw;
        arrPromise.push(new Promise(function (resolve, reject) {
            modelService.countAllFoodInfo(parameter, function (err, result, fields) {
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
            modelService.getAllFoodInfo(parameter, function (err, result, fields) {
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
                let dataFood = JSON.parse(fields.data);
                if(dataFood && dataFood.length > 0){
                    for(let foodType of dataFood){
                        let paramFoodType = {
                            name: foodType.name,
                            hospital_id: req.user.hospital_id,
                            department_id: req.user.department_id,
                            created_by: req.user.id
                        }
                        let sqlFoodType = "SELECT * FROM food_type WHERE `name` =  ? AND created_by = ?";
                        webService.getListTable(sqlFoodType, [paramFoodType.name, paramFoodType.created_by]).then(responseData =>{
                            if(responseData.success && responseData.data.length == 0){
                                webService.addRecordTable(paramFoodType, 'food_type').then(responseData1 =>{
                                    if(responseData1.success){
                                        if(foodType.detail && foodType.detail.length > 0){
                                            for(let food of foodType.detail){
                                                let paramFood = {
                                                    food_type_id: responseData1.data.insertId,
                                                    name: food[0],
                                                    weight: isNaN(parseInt(food[1])) ? null : parseInt(food[1]),
                                                    energy: isNaN(parseInt(food[1])) ? null : parseInt(food[2]),
                                                    protein: isNaN(parseFloat(food[3])) ? '' : food[3],
                                                    animal_protein: isNaN(parseFloat(food[4])) ? '' : food[4],
                                                    lipid: isNaN(parseFloat(food[5])) ? '' : food[5],
                                                    unanimal_lipid: isNaN(parseFloat(food[6])) ? '' : food[6],
                                                    carbohydrate: isNaN(parseFloat(food[7])) ? '' : food[7],
                                                    fiber: isNaN(parseFloat(food[8])) ? '' : food[8],
                                                    ash: isNaN(parseFloat(food[9])) ? '' : food[9],
                                                    retinol: isNaN(parseFloat(food[10])) ? '' : food[10],
                                                    caroten: isNaN(parseFloat(food[11])) ? '' : food[11],
                                                    vitamin_b1: isNaN(parseFloat(food[12])) ? '' : food[12],
                                                    vitamin_b2: isNaN(parseFloat(food[13])) ? '' : food[13],
                                                    vitamin_pp: isNaN(parseFloat(food[14])) ? '' : food[14],
                                                    vitamin_c: isNaN(parseFloat(food[15])) ? '' : food[15],
                                                    canxi: isNaN(parseFloat(food[16])) ? '' : food[16],
                                                    p: isNaN(parseFloat(food[17])) ? '' : food[17],
                                                    fe: isNaN(parseFloat(food[18])) ? '' : food[18],
                                                    hospital_id: req.user.hospital_id,
                                                    department_id: req.user.department_id,
                                                    created_by: req.user.id
                                                };
                                                let sqlFoodInfo = "SELECT * FROM food_info WHERE `name` =  ? AND created_by = ?";
                                                webService.getListTable(sqlFoodInfo, [paramFood.name, paramFood.created_by]).then(responseData2 =>{
                                                    if(responseData2.success && responseData2.data.length == 0){
                                                        webService.addRecordTable(paramFood, 'food_info', true);
                                                    }
                                                });
                                            }
                                        }
                                    }
                                });
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
    return path.resolve(__dirname, "../views/food_info/" + name + ".ejs");
}

module.exports = router;