var express         = require('express'),
    router          = express.Router(),
    path            = require('path'),
    returnUrl       = "/admin/food-info",
    notice_admin    = "Tài khoản của bạn không có quyền truy cập!",
    logService      = require('../models/logModel'),
    adminService    = require('../models/adminModel'),
    modelService    = require('../models/foodInfoModel'),
    foodTypeService = require('../models/foodTypeModel'); 

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
        foodTypeService.getAllFoodType(function (err, result, fields) {
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
        if (!req.user.isAdmin) {
            throw new Error(notice_admin);
        }
        let arrPromise = [],
            foodType   = [],
            foodInfo = {};

        arrPromise.push(new Promise(function (resolve, reject) {
            foodTypeService.getAllFoodType(function (err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function(log_id){
                        str_error.push(err.sqlMessage);
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
                    return logService.create(req, err).then(function(log_id){
                        str_error.push(err.sqlMessage);
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
        if (!req.user.isAdmin) {
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
                carbohydrate: isNaN(parseFloat(req.body.carbohydrate)) ? null : req.body.carbohydrate
            };
        console.log("create", parameter);
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
        if (!req.user.isAdmin) {
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
                carbohydrate: isNaN(parseFloat(req.body.carbohydrate)) ? null : req.body.carbohydrate
            };
            console.log("parameter", parameter);
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
            modelService.countAllFoodInfo(parameter, function (err, result, fields) {
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
            modelService.getAllFoodInfo(parameter, function (err, result, fields) {
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
    return path.resolve(__dirname, "../views/food_info/" + name + ".ejs");
}

module.exports = router;