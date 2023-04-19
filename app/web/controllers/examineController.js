var express         = require('express'),
    router          = express.Router(),
    url             = require('url'),
    path            = require('path'),
    moment          = require('moment'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    examineService  = require('./../models/examineModel');

router.get('/', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 1).then(function(filter){
            var str_errors  = filter.error,
                arrPromise  = [],
                listExamine = [],
                paginator   = {
                    perPage: 0,
                    page: 0,
                    totalItem: 0,
                    totalPage: 0,
                    hasPrevPage: false,
                    hasNextPage: false,
                    nextPage: '',
                    prevPage: '',
                    currentPage: '',
                };

            arrPromise.push(new Promise(function (resolve, reject) {
                examineService.countAllExamine({search: filter.search, filter: true}, function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(responseData){
                            if(responseData.message) str_errors.push(responseData.message);
                            else str_errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    if (result !== undefined) {
                        paginator.totalItem = result[0].count;
                    }
                    resolve();
                });
            }));

            arrPromise.push(new Promise(function (resolve, reject) {
                examineService.getAllExamine({search: filter.search, filter: true}, function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(responseData){
                            if(responseData.message) str_errors.push(responseData.message);
                            else str_errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    if (result !== undefined) {
                        listExamine = result;
                    }
                    resolve();
                });
            }));

            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    paginator.page        = filter.search.page;
                    paginator.perPage     = filter.search.take;
                    paginator.currentPage = filter.requestUri;
                    paginator.totalPage   = Math.ceil(paginator.totalItem / paginator.perPage);
                    if(paginator.totalPage > paginator.page){
                        paginator.hasNextPage = true;
                        paginator.nextPage    = filter.requestUri + '&page=' + (paginator.page + 1);
                    }
                    if(paginator.page >= 2){
                        paginator.hasPrevPage = true;
                        paginator.prevPage    = filter.requestUri + '&page=' + (paginator.page - 1);
                    }
                    res.render('examine/index.ejs', { 
                        user: req.user,
                        errors: str_errors,
                        listExamine: listExamine,
                        moment: moment,
                        webService: webService,
                        filter: filter,
                        paginator: paginator,
                        link:'examine'
                    });
                }).catch(err => {
                    res.render("examine/index.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter,
                        link:'examine'
                    });
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            res.render("examine/index.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter
            });
        })
    }
});

router.get('/edit/:id', function(req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        var arrPromise       = [],
            str_errors       = [],
            resultData       = {
                filter: [],
                detailExamine: {},
                nutritionAdvice: [],
                activeModeOfLiving: [],
                medicine: [],
                // medicalTest: [],
                medicalTestType: [],
                menuTime: [],
                menuExample: [],
                diagnostic: []
            };
        arrPromise.push(webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));

        let sqlNutritionAdviceList = 'SELECT * FROM nutrition_advice WHERE id > 0';
        let sqlNutritionAdviceListPermit = webService.addPermitTable(sqlNutritionAdviceList, req.user);
        arrPromise.push(webService.getListTable(sqlNutritionAdviceListPermit.sqlQuery, sqlNutritionAdviceListPermit.paramSql).then(responseData =>{
            if(responseData.success){
                resultData.nutritionAdvice = responseData.data;
            }else{
                str_errors.push(responseData.message);
            }
        }));

        let sqlactiveModeOfLivingList = 'SELECT * FROM active_mode_of_living WHERE id > 0';
        let sqlactiveModeOfLivingListPermit = webService.addPermitTable(sqlactiveModeOfLivingList, req.user);
        arrPromise.push(webService.getListTable(sqlactiveModeOfLivingListPermit.sqlQuery, sqlactiveModeOfLivingListPermit.paramSql).then(responseData1 =>{
            if(responseData1.success){
                resultData.activeModeOfLiving = responseData1.data;
            }else{
                str_errors.push(responseData1.message);
            }
        }));

        arrPromise.push(examineService.getDetailExamineById(req.params.id).then(function(detailExamine) {
            if (detailExamine.success) {
                if(detailExamine.data.length == 0){
                    str_errors.push("Không tìm thấy thông tin bài viết có mã #" + req.params.id);
                }else{
                    if (!req.user.role_id.includes(1) && !req.user.role_id.includes(3)){
                        //Nếu là quản lý xem toàn viện
                        if(req.user.role_id.includes(5) && req.user.hospital_id !== detailExamine.data[0].hospital_id){
                            str_errors.push("Bạn không có quyền truy cập thông tin bài #" + req.params.id);
                        }else if(req.user.role_id.includes(4) && req.user.department_id !== detailExamine.data[0].department_id){
                            //Nếu là bác sĩ xem theo khoa
                            str_errors.push("Bạn không có quyền truy cập thông tin bài #" + req.params.id);
                        }else if(req.user.role_id.includes(2) && !(req.user.phone == detailExamine.data[0].cus_phone || req.user.email == detailExamine.data[0].cus_email)){
                            //Nếu là bệnh nhân xem theo số điện thoại hoặc email
                            str_errors.push("Bạn không có quyền truy cập thông tin bài #" + req.params.id);
                        }
                    }
                    resultData.detailExamine = detailExamine.data[0];
                }
            }else{
                str_errors = str_errors.push(detailExamine.message);
            }
        }));

        let sqlMedicine = 'SELECT * FROM medicine WHERE hospital_id = ?';
        arrPromise.push(webService.getListTable(sqlMedicine, [req.user.hospital_id]).then(responseData2 =>{
            if(responseData2.success){
                resultData.medicine = responseData2.data;
            }else{
                str_errors.push(responseData2.message);
            }
        }));

        // let sqlMedicalTest = 'SELECT * FROM medical_test';
        // arrPromise.push(webService.getListTable(sqlMedicalTest, []).then(responseData3 =>{
        //     if(responseData3.success){
        //         resultData.medicalTest = responseData3.data;
        //     }else{
        //         str_errors.push(responseData3.message);
        //     }
        // }));

        let sqlMedicalTestType = 'SELECT * FROM medical_test_type';
        arrPromise.push(webService.getListTable(sqlMedicalTestType, []).then(responseData6 =>{
            if(responseData6.success){
                resultData.medicalTestType = responseData6.data;
            }else{
                str_errors.push(responseData6.message);
            }
        }));

        let sqlMenuTime = 'SELECT id, time AS name FROM menu_time WHERE hospital_id = ?';
        arrPromise.push(webService.getListTable(sqlMenuTime, [req.user.hospital_id]).then(responseData4 =>{
            if(responseData4.success){
                resultData.menuTime = responseData4.data;
            }else{
                str_errors.push(responseData4.message);
            }
        }));

        let sqlDiagnosticList = 'SELECT * FROM diagnostic WHERE id > 0';
        let sqlDiagnosticListPermit = webService.addPermitTable(sqlDiagnosticList, req.user);
        arrPromise.push(webService.getListTable(sqlDiagnosticListPermit.sqlQuery, sqlDiagnosticListPermit.paramSql).then(responseData =>{
            if(responseData.success){
                resultData.diagnostic = responseData.data;
            }else{
                str_errors.push(responseData.message);
            }
        }));

        let sqlMenuExampleList = 'SELECT * FROM menu_example WHERE id > 0';
        let sqlMenuExampleListPermit = webService.addPermitTable(sqlMenuExampleList, req.user);
        arrPromise.push(webService.getListTable(sqlMenuExampleListPermit.sqlQuery, sqlMenuExampleListPermit.paramSql).then(responseData5 =>{
            if(responseData5.success){
                resultData.menuExample = responseData5.data;
            }else{
                str_errors.push(responseData5.message);
            }
        }));

        return new Promise(function(resolve, reject) {
            Promise.all(arrPromise).then(function() {
                res.render("examine/create.ejs", {
                    moment: moment,
                    user: req.user,
                    errors: str_errors,
                    filter: resultData.filter,
                    examine: resultData.detailExamine,
                    activeModeOfLiving: resultData.activeModeOfLiving,
                    nutritionAdvice: resultData.nutritionAdvice,
                    medicine: resultData.medicine,
                    // medicalTest: resultData.medicalTest,
                    medicalTestType: resultData.medicalTestType,
                    medicalTestExamine: JSON.parse(resultData.detailExamine.medical_test ? resultData.detailExamine.medical_test : '[]'),
                    prescriptionExamine: JSON.parse(resultData.detailExamine.prescription ? resultData.detailExamine.prescription : '[]'),
                    menuExamine: JSON.parse(resultData.detailExamine.menu_example ? resultData.detailExamine.menu_example : '[]'),
                    menuExample: resultData.menuExample,
                    page:'edit',
                    menuTime: resultData.menuTime,
                    link:'examine-page',
                    diagnostic: resultData.diagnostic
                });
            }).catch(err => {
                res.render("examine/create.ejs", {
                    user: req.user,
                    errors: [err],
                    filter: resultData.filter,
                    examine: {},
                    activeModeOfLiving:[],
                    nutritionAdvice: [],
                    medicine: [],
                    // medicalTest: [],
                    medicalTestType:[],
                    medicalTestExamine: [],
                    prescriptionExamine: [],
                    menuExample:[],
                    page:'edit',
                    menuTime:[],
                    link:'examine-page',
                    diagnostic: []
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            res.render("examine/create.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter,
                examine: {},
                activeModeOfLiving:[],
                nutritionAdvice: [],
                medicine: [],
                // medicalTest: [],
                medicalTestType: [],
                medicalTestExamine: [],
                prescriptionExamine: [],
                menuExample: [],
                page:'edit',
                menuTime:[],
                link:'examine-page',
                diagnostic: []
            });
        })
    }
});

router.get('/create', function(req, res, next) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        var str_errors = [],
            arrPromise = [],
            resultData = {
                filter: [],
                nutritionAdvice: [],
                activeModeOfLiving: [],
                medicine: [],
                // medicalTest: [],
                medicalTestType: [],
                menuTime: [],
                menuExample: [],
                diagnostic: []
            };

        arrPromise.push(webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));
        let sqlNutritionAdviceList = 'SELECT * FROM nutrition_advice WHERE id > 0';
        let sqlNutritionAdviceListPermit = webService.addPermitTable(sqlNutritionAdviceList, req.user);
        arrPromise.push(webService.getListTable(sqlNutritionAdviceListPermit.sqlQuery, sqlNutritionAdviceListPermit.paramSql).then(responseData =>{
            if(responseData.success){
                resultData.nutritionAdvice = responseData.data;
            }else{
                str_errors.push(responseData.message);
            }
        }));

        let sqlDiagnosticList = 'SELECT * FROM diagnostic WHERE id > 0';
        let sqlDiagnosticListPermit = webService.addPermitTable(sqlDiagnosticList, req.user);
        arrPromise.push(webService.getListTable(sqlDiagnosticListPermit.sqlQuery, sqlDiagnosticListPermit.paramSql).then(responseData =>{
            if(responseData.success){
                resultData.diagnostic = responseData.data;
            }else{
                str_errors.push(responseData.message);
            }
        }));

        let sqlactiveModeOfLivingList = 'SELECT * FROM active_mode_of_living WHERE id > 0';
        let sqlactiveModeOfLivingListPermit = webService.addPermitTable(sqlactiveModeOfLivingList, req.user);
        arrPromise.push(webService.getListTable(sqlactiveModeOfLivingListPermit.sqlQuery, sqlactiveModeOfLivingListPermit.paramSql).then(responseData1 =>{
            if(responseData1.success){
                resultData.activeModeOfLiving = responseData1.data;
            }else{
                str_errors.push(responseData1.message);
            }
        }));

        let sqlMedicine = 'SELECT * FROM medicine WHERE hospital_id = ?';
        arrPromise.push(webService.getListTable(sqlMedicine, [req.user.hospital_id]).then(responseData2 =>{
            if(responseData2.success){
                resultData.medicine = responseData2.data;
            }else{
                str_errors.push(responseData2.message);
            }
        }));

        // let sqlMedicalTest = 'SELECT * FROM medical_test';
        // arrPromise.push(webService.getListTable(sqlMedicalTest, []).then(responseData3 =>{
        //     if(responseData3.success){
        //         resultData.medicalTest = responseData3.data;
        //     }else{
        //         str_errors.push(responseData3.message);
        //     }
        // }));

        let sqlMedicalTestType = 'SELECT * FROM medical_test_type';
        arrPromise.push(webService.getListTable(sqlMedicalTestType, []).then(responseData6 =>{
            if(responseData6.success){
                resultData.medicalTestType = responseData6.data;
            }else{
                str_errors.push(responseData6.message);
            }
        }));

        let sqlMenuTime = 'SELECT id, time AS name FROM menu_time WHERE hospital_id = ?';
        arrPromise.push(webService.getListTable(sqlMenuTime, [req.user.hospital_id]).then(responseData4 =>{
            if(responseData4.success){
                resultData.menuTime = responseData4.data;
            }else{
                str_errors.push(responseData4.message);
            }
        }));

        let sqlMenuExampleList = 'SELECT * FROM menu_example WHERE id > 0';
        let sqlMenuExampleListPermit = webService.addPermitTable(sqlMenuExampleList, req.user);
        arrPromise.push(webService.getListTable(sqlMenuExampleListPermit.sqlQuery, sqlMenuExampleListPermit.paramSql).then(responseData5 =>{
            if(responseData5.success){
                resultData.menuExample = responseData5.data;
            }else{
                str_errors.push(responseData5.message);
            }
        }));
        
        return new Promise(function(resolve, reject) {
            Promise.all(arrPromise).then(function() {
                res.render("examine/create.ejs", {
                    user: req.user,
                    errors: str_errors,
                    filter: resultData.filter,
                    moment: moment,
                    page:'create',
                    examine:{},
                    activeModeOfLiving: resultData.activeModeOfLiving,
                    nutritionAdvice: resultData.nutritionAdvice,
                    medicine: resultData.medicine,
                    // medicalTest: resultData.medicalTest,
                    medicalTestType: resultData.medicalTestType,
                    medicalTestExamine: [],
                    prescriptionExamine: [],
                    menuExamine: [],
                    menuExample: resultData.menuExample,
                    menuTime:resultData.menuTime,
                    link:'examine-page',
                    diagnostic: resultData.diagnostic
                });
            }).catch(err => {
                res.render("examine/create.ejs", {
                    user: req.user,
                    errors: [err],
                    filter: resultData.filter,
                    page:'create',
                    examine: {},
                    activeModeOfLiving:[],
                    nutritionAdvice: [],
                    medicine: [],
                    // medicalTest: [],
                    medicalTestExamine:[],
                    prescriptionExamine: [],
                    medicalTestType: [],
                    menuTime:[],
                    menuExample: [],
                    menuExamine: [],
                    link:'examine-page',
                    diagnostic: []
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            res.render("examine/create.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter,
                page:'create',
                examine:{},
                activeModeOfLiving:[],
                nutritionAdvice: [],
                medicine: [],
                // medicalTest: [],
                medicalTestType: [],
                medicalTestExamine:[],
                prescriptionExamine: [],
                menuTime:[],
                menuExamine: [],
                menuExample: [],
                link:'examine-page',
                diagnostic: []
            });
        })
    }
});

router.post('/create', async function(req, res, next) {
    var resultData = {
        success: false,
        message: "",
        data: ''
    };
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        var str_errors   = [],
            parameter    = {
                cus_name:               req.body.cus_name,
                cus_phone:              req.body.cus_phone,
                cus_email:              req.body.cus_email,
                cus_gender:             req.body.cus_gender,
                cus_birthday:           req.body.cus_birthday,
                cus_address:            req.body.cus_address,
                diagnostic:             req.body.diagnostic,
                cus_length:             req.body.cus_length,
                cus_cctc:               req.body.cus_cctc,
                cus_cntc:               req.body.cus_cntc,
                cus_cnht:               req.body.cus_cnht,
                cus_cnbt:               req.body.cus_cnbt,
                cus_bmi:                req.body.cus_bmi,
                clinical_examination:   req.body.clinical_examination,
                erythrocytes:           req.body.erythrocytes,
                cus_bc:                 req.body.cus_bc,
                cus_tc:                 req.body.cus_tc,
                cus_albumin:            req.body.cus_albumin,
                cus_nakcl:              req.body.cus_nakcl,
                cus_astaltggt:          req.body.cus_astaltggt,
                cus_urecreatinin:       req.body.cus_urecreatinin,
                cus_bilirubin:          req.body.cus_bilirubin,
                exa_note:               req.body.exa_note,
                cus_fat:                req.body.cus_fat,
                cus_water:              req.body.cus_water,
                cus_visceral_fat:       req.body.cus_visceral_fat,
                cus_bone_weight:        req.body.cus_bone_weight,
                cus_chcb:               req.body.cus_chcb,
                cus_waist:              req.body.cus_waist,
                cus_butt:               req.body.cus_butt,
                cus_cseomong:           req.body.cus_cseomong,
                active_mode_of_living:  req.body.active_mode_of_living,
                glucid_should_use:      req.body.glucid_should_use,
                glucid_limited_use:     req.body.glucid_limited_use,
                glucid_should_not_use:  req.body.glucid_should_not_use,
                protein_should_use:     req.body.protein_should_use,
                protein_limited_use:    req.body.protein_limited_use,
                protein_should_not_use: req.body.protein_should_not_use,
                lipid_should_use:       req.body.lipid_should_use,
                lipid_limited_use:      req.body.lipid_limited_use,
                lipid_should_not_use:   req.body.lipid_should_not_use,
                vitamin_ck_should_use:  req.body.vitamin_ck_should_use,
                vitamin_ck_limited_use: req.body.vitamin_ck_limited_use,
                vitamin_ck_should_not_use: req.body.vitamin_ck_should_not_use,
                nutrition_advice_id:    req.body.nutrition_advice_id,
                active_mode_of_living_id: req.body.active_mode_of_living_id,
                medical_test:           req.body.medical_test,  
                menu_example:           req.body.menu_example,  
                prescription:           req.body.prescription,
                department_id:          req.user.department_id,
                hospital_id:            req.user.hospital_id,
                status:                 req.body.action,
                created_by:             req.user.id
            },
            id_examine = '';
        
        if(!parameter.cus_name){
            str_errors.push("Thiếu họ tên!");
        }
        if(!parameter.cus_gender){
            str_errors.push("Thiếu giới tính!");
        }
        if(!parameter.cus_birthday){
            str_errors.push("Thiếu ngày sinh!");
        }
        if(!parameter.cus_phone){
            str_errors.push("Thiếu số điện thoại!");
        }
        if (str_errors.length > 0) {
            resultData.message = str_errors.toString();
            res.json(resultData);
            return;
        } else {
            parameter.cus_birthday = parameter.cus_birthday.split("-").reverse().join("-");
            await webService.createCountId(req.user.hospital_id).then(async success =>{
                if(success.success && success.id_count){
                    parameter['count_id'] = success.id_count;
                    await webService.addRecordTable( parameter, 'examine', true).then(responseData =>{
                        if(!responseData.success){
                            resultData.message = responseData.message;
                            res.json(resultData);
                            logService.create(req, responseData.message);
                            return;
                        }else{
                            console.log("id_examine", responseData.data.insertId);
                            id_examine = responseData.data.insertId;
                            resultData.success = true;
                            resultData.message = "Lưu phiếu khám thành công!";
                            res.json(resultData);
                        }
                    });
                }else{
                    res.json(resultData);
                    return;
                }
            });
            // Them khach hang vao database
            let paramCustomer = {
                cus_name:      parameter.cus_name,
                cus_phone:     parameter.cus_phone,
                cus_email:     parameter.cus_email,
                cus_gender:    parameter.cus_gender,
                cus_birthday:  parameter.cus_birthday,
                cus_address:   parameter.cus_address,
                department_id: parameter.department_id,
                hospital_id: parameter.hospital_id
            };

            let sqlFindCustomer = 'SELECT * FROM customer WHERE cus_phone = ? AND cus_gender = ? AND cus_birthday = ?';
            webService.getListTable(sqlFindCustomer ,[parameter.cus_phone, parameter.cus_gender, parameter.cus_birthday]).then(responseData1 =>{
                console.log("sqlFindCustomer", responseData1);
                if(responseData1.success){
                    if(responseData1.data && responseData1.data.length > 0){
                        let customerData = responseData1.data[0];
                        if(paramCustomer.cus_name !== customerData.cus_name){
                            // Cap nhat lai thong tin khach hang neu thay doi thong tin
                            webService.updateRecordTable(paramCustomer, {id: customerData.id}, 'customer').then(responseData2 => {
                                if(!responseData2.success){
                                    logService.create(req, responseData2.message);
                                }
                            });
                            // cập nhật id customer
                            webService.updateRecordTable({customer_id: customerData.id}, {id: id_examine}, 'examine').then(responseData3 => {
                                if(!responseData3.success){
                                    logService.create(req, responseData3.message);
                                }
                            });
                        }
                    }else{
                        // neu khong co khach hang thi them moi
                        webService.addRecordTable( paramCustomer, 'customer', true).then(responseData4 =>{
                            console.log("addRecordTable customer", responseData4, id_examine);
                            if(!responseData4.success){
                                logService.create(req, responseData4.message);
                            }else{
                                // cập nhật id customer
                                webService.updateRecordTable({customer_id: responseData4.data.insertId}, {id: id_examine}, 'examine').then(responseData5 => {
                                    if(!responseData5.success){
                                        logService.create(req, responseData5.message);
                                    }
                                });
                            }
                        })
                    }
                }
            });
            return;
        }
    } catch (e) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

router.post('/edit/:id', function(req, res, next) {
    var resultData = {
        success: false,
        message: "",
        data: ''
    };
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        var str_errors   = [],
            parameter    = {
                cus_name:               req.body.cus_name,
                cus_phone:              req.body.cus_phone,
                cus_email:              req.body.cus_email,
                cus_gender:             req.body.cus_gender,
                cus_birthday:           req.body.cus_birthday,
                cus_address:            req.body.cus_address,
                cus_anamnesis:          req.body.cus_anamnesis,
                cus_living_habits:      req.body.cus_living_habits,
                diagnostic:             req.body.diagnostic,
                cus_length:             req.body.cus_length,
                cus_cctc:               req.body.cus_cctc,
                cus_cntc:               req.body.cus_cntc,
                cus_cnht:               req.body.cus_cnht,
                cus_cnbt:               req.body.cus_cnbt,
                cus_bmi:                req.body.cus_bmi,
                clinical_examination:   req.body.clinical_examination,
                erythrocytes:           req.body.erythrocytes,
                cus_bc:                 req.body.cus_bc,
                cus_tc:                 req.body.cus_tc,
                cus_albumin:            req.body.cus_albumin,
                cus_nakcl:              req.body.cus_nakcl,
                cus_astaltggt:          req.body.cus_astaltggt,
                cus_urecreatinin:       req.body.cus_urecreatinin,
                cus_bilirubin:          req.body.cus_bilirubin,
                exa_note:               req.body.exa_note,
                cus_fat:                req.body.cus_fat,
                cus_water:              req.body.cus_water,
                cus_visceral_fat:       req.body.cus_visceral_fat,
                cus_bone_weight:        req.body.cus_bone_weight,
                cus_chcb:               req.body.cus_chcb,
                cus_waist:              req.body.cus_waist,
                cus_butt:               req.body.cus_butt,
                cus_cseomong:           req.body.cus_cseomong,
                active_mode_of_living:  req.body.active_mode_of_living,
                glucid_should_use:      req.body.glucid_should_use,
                glucid_limited_use:     req.body.glucid_limited_use,
                glucid_should_not_use:  req.body.glucid_should_not_use,
                protein_should_use:     req.body.protein_should_use,
                protein_limited_use:    req.body.protein_limited_use,
                protein_should_not_use: req.body.protein_should_not_use,
                lipid_should_use:       req.body.lipid_should_use,
                lipid_limited_use:      req.body.lipid_limited_use,
                lipid_should_not_use:   req.body.lipid_should_not_use,
                vitamin_ck_should_use:  req.body.vitamin_ck_should_use,
                vitamin_ck_limited_use: req.body.vitamin_ck_limited_use,
                vitamin_ck_should_not_use: req.body.vitamin_ck_should_not_use,
                nutrition_advice_id:    req.body.nutrition_advice_id,
                active_mode_of_living_id: req.body.active_mode_of_living_id,
                medical_test:           req.body.medical_test,
                prescription:           req.body.prescription,
                menu_example:           req.body.menu_example,
                status:                 req.body.action
            };
        
        if(!parameter.cus_name){
            str_errors.push("Thiếu họ tên!");
        }
        if(!parameter.cus_gender){
            str_errors.push("Thiếu giới tính!");
        }
        if(!parameter.cus_birthday){
            str_errors.push("Thiếu ngày sinh!");
        }
        if(!parameter.cus_phone){
            str_errors.push("Thiếu số điện thoại!");
        }
        if (str_errors.length > 0) {
            resultData.message = str_errors.toString();
            res.json(resultData);
            return;
        } else {
            parameter.cus_birthday = parameter.cus_birthday.split("-").reverse().join("-");

            webService.updateRecordTable( parameter, {id:req.params.id},'examine').then(responseData =>{
                if(!responseData.success){
                    resultData.message = responseData.message;
                    logService.create(req, responseData.message);
                    res.json(resultData);
                    return;
                }else{
                    resultData.success = true;
                    resultData.message = "Lưu phiếu khám thành công!";
                    res.json(resultData);
                }
            });
            // Them khach hang vao database
            let paramCustomer = {
                cus_name:      parameter.cus_name,
                cus_phone:     parameter.cus_phone,
                cus_email:     parameter.cus_email,
                cus_gender:    parameter.cus_gender,
                cus_birthday:  parameter.cus_birthday,
                cus_address:   parameter.cus_address,
                department_id: parameter.department_id,
                hospital_id: parameter.hospital_id
            };

            let sqlFindCustomer = 'SELECT * FROM customer WHERE cus_phone = ? AND cus_gender = ? AND cus_birthday = ?';
            webService.getListTable(sqlFindCustomer ,[parameter.cus_phone, parameter.cus_gender, parameter.cus_birthday]).then(responseData1 =>{
                console.log("sqlFindCustomer", responseData1);
                if(responseData1.success){
                    if(responseData1.data && responseData1.data.length > 0){
                        let customerData = responseData1.data[0];
                        if(paramCustomer.cus_name !== customerData.cus_name){
                            // Cap nhat lai thong tin khach hang neu thay doi thong tin
                            webService.updateRecordTable(paramCustomer, {id: customerData.id}, 'customer').then(responseData2 => {
                                if(!responseData2.success){
                                    logService.create(req, responseData2.message);
                                }
                            });
                            // cập nhật id customer
                            webService.updateRecordTable({customer_id: customerData.id}, {id: req.params.id}, 'examine').then(responseData3 => {
                                if(!responseData3.success){
                                    logService.create(req, responseData3.message);
                                }
                            });
                        }
                    }else{
                        // neu khong co khach hang thi them moi
                        webService.addRecordTable( paramCustomer, 'customer', true).then(responseData4 =>{
                            console.log("addRecordTable customer", responseData4, id_examine);
                            if(!responseData4.success){
                                logService.create(req, responseData4.message);
                            }else{
                                // cập nhật id customer
                                webService.updateRecordTable({customer_id: responseData4.data.insertId}, {id: req.params.id}, 'examine').then(responseData5 => {
                                    if(!responseData5.success){
                                        logService.create(req, responseData5.message);
                                    }
                                });
                            }
                        })
                    }
                }
            });
            return;
        }
    } catch (e) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

router.get('/suggest/food-name', function(req, res, next){
    var resultData = {
        success: false,
        message: "",
        data: []
    };
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        let sqlFoodName = 'SELECT * FROM food_info WHERE department_id = ? AND name LIKE ?';
        webService.getListTable(sqlFoodName, [req.user.department_id, '%' + req.query.term + '%']).then(responseData =>{
            if(responseData.success && responseData.data.length > 0){
                resultData.message = "Thành công";
                resultData.success = true;
                resultData.data = responseData.data;
            }else{
                resultData.message = "Tải dữ liệu thất bại!"
                resultData.data = [];
            }
            res.json(resultData);
        });
    } catch (error) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

router.get('/suggest/phone', function(req, res, next){
    var resultData = {
        success: false,
        message: "",
        data: []
    };
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        let sqlPhone = 'SELECT * FROM customer WHERE cus_phone LIKE ?';
        webService.getListTable(sqlPhone, ['%' + req.query.term + '%']).then(responseData =>{
            if(responseData.success && responseData.data.length > 0){
                resultData.message = "Thành công";
                resultData.success = true;
                resultData.data = responseData.data;
            }else{
                resultData.message = "Tải dữ liệu thất bại!"
                resultData.data = [];
            }
            res.json(resultData);
        });
    } catch (error) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

router.post('/save-menu', (req, res, next) =>{
    var resultData = {
        success: false,
        message: ""
    };
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        var str_errors   = [],
            isCreate     = isNaN(parseInt(req.body.isCreate)) ? 0 : parseInt(req.body.isCreate),
            parameter    = {
                name_menu:      req.body.name,  
                detail:         req.body.detail,  
                department_id:  req.user.department_id,
                hospital_id:    req.user.hospital_id,
                created_by:     req.user.id
            };
        console.log("save-menu", req.body);
        if(!parameter.name_menu){
            str_errors.push("Thiếu tên menu!<br>");
        }
        if(!parameter.detail){
            str_errors.push("Thiếu nội dung menu!");
        }
        
        if (str_errors.length > 0) {
            resultData.message = str_errors.toString();
            res.json(resultData);
            return;
        } else {
            if(isCreate == 1){
                webService.addRecordTable( parameter, 'menu_example', true).then(responseData =>{
                    if(!responseData.success){
                        logService.create(req, responseData.message);
                        resultData.message = responseData.message;
                    }else{
                        resultData.message = "Lưu mẫu thành công";
                        resultData.success = true;
                    }
                    res.json(resultData);
                })
            }else{
                if(req.body.menu_id){
                    webService.updateRecordTable(parameter, {id: req.body.menu_id}, 'menu_example').then(responseData2 => {
                        if(!responseData2.success){
                            logService.create(req, responseData2.message);
                            resultData.message = responseData2.message;
                        }else{
                            resultData.message = "Lưu mẫu thành công"; 
                            resultData.success = true;
                        }
                        res.json(resultData);
                    });
                }
            }
        }
    } catch (e) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

router.get('/search', (req, res, next) =>{
    try {
        webService.createSideBarFilter(req, 2, 20).then(function(filter){
            var str_errors  = filter.error,
                arrPromise  = [],
                listExamine = [],
                paginator   = {
                    perPage: 0,
                    page: 0,
                    totalItem: 0,
                    totalPage: 0,
                    hasPrevPage: false,
                    hasNextPage: false,
                    nextPage: '',
                    prevPage: '',
                    currentPage: '',
                };
            console.log("req.query", req.query.cus_name, req.query.cus_phone, filter);
            if(filter.search.name.length > 0 && filter.search.phone.length > 0){
                arrPromise.push(new Promise(function (resolve, reject) {
                    examineService.countAllExamine2({search: filter.search, filter: true}, function (err, result, fields) {
                        if (err) {
                            return logService.create(req, err).then(function(responseData){
                                if(responseData.message) str_errors.push(responseData.message);
                                else str_errors.push(err.sqlMessage);
                                resolve();
                            });
                        }
                        if (result !== undefined) {
                            paginator.totalItem = result[0].count;
                        }
                        resolve();
                    });
                }));
    
                arrPromise.push(new Promise(function (resolve, reject) {
                    examineService.getAllExamine2({search: filter.search, filter: true}, function (err, result, fields) {
                        if (err) {
                            return logService.create(req, err).then(function(responseData){
                                if(responseData.message) str_errors.push(responseData.message);
                                else str_errors.push(err.sqlMessage);
                                resolve();
                            });
                        }
                        if (result !== undefined) {
                            listExamine = result;
                        }
                        resolve();
                    });
                }));
            }else{
                // if(filter.search.name.length == 0){
                //     str_errors.push("Vui lòng nhập họ tên!");
                // }
                // if(filter.search.phone.length == 0){
                //     str_errors.push("Vui lòng nhập số điện thoại!");
                // }
            }

            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    paginator.page        = filter.search.page;
                    paginator.perPage     = filter.search.take;
                    paginator.currentPage = filter.requestUri;
                    paginator.totalPage   = Math.ceil(paginator.totalItem / paginator.perPage);
                    if(paginator.totalPage > paginator.page){
                        paginator.hasNextPage = true;
                        paginator.nextPage    = filter.requestUri + '&page=' + (paginator.page + 1);
                    }
                    if(paginator.page >= 2){
                        paginator.hasPrevPage = true;
                        paginator.prevPage    = filter.requestUri + '&page=' + (paginator.page - 1);
                    }
                    res.render('search/index.ejs', { 
                        errors: str_errors,
                        listExamine: listExamine,
                        moment: moment,
                        filter: filter,
                        paginator: paginator
                    });
                }).catch(err => {
                    res.render("search/index.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter
                    });
                });
            });
        });
    } catch (error) {
        logService.create(req, error.message).then(function() {
            res.render("search/index.ejs", {
                user: req.user,
                errors: [error.message],
                filter: {}
            });
        });
    }
});

router.post('/detail-examine', (req, res, next) =>{
    try {
        var resultData = {
            success: false,
            message: '',
            data: ''
        },
        examine = {},
        prescriptionExamine = [],
        menuExample = [];

        let sqlDetailExamine = 'SELECT * FROM examine WHERE id = ?';
        webService.getListTable(sqlDetailExamine ,[req.body.id]).then(async responseData =>{
            if(responseData.success && responseData.data && responseData.data.length > 0){
                examine   = responseData.data[0];
                prescriptionExamine = JSON.parse(examine.prescription ? examine.prescription : '[]');
                menuExample = JSON.parse(examine.menu_example ? examine.menu_example : '[]');
                let sqlGetAlternativeFood = 'SELECT food_main, food_replace FROM alternative_food';
                let dataAlternativeFoodRespone = await webService.getListTable(sqlGetAlternativeFood);
                let dataAlternativeFood = dataAlternativeFoodRespone.success ? dataAlternativeFoodRespone.data : [];
                
                express().render(path.resolve(__dirname, "../views/search/detail.ejs"), {examine,prescriptionExamine,menuExample,dataAlternativeFood}, (err, html) => {
                    if(err){
                        console.log("err", err);
                        resultData.message = 'Lỗi xem chi tiết phiếu khám';
                    }else{
                        resultData.success = true;
                        resultData.data = html;
                    }
                });
            }else{
                resultData.message = 'Lỗi xem chi tiết phiếu khám';
            }
            res.json(resultData);
        });
    } catch (error) {
        resultData.message = error.message;
        logService.create(req, error.message).then(function() {
            res.json(resultData);
        });
    }
});

router.post('/table/history', (req, res, next) =>{
    try {
        var resultData = {
            success: false,
            message: '',
            data: ''
        },
        listExamine = [];
        console.log("req.body.cus_id", req.body.cus_id);
        let sqlDetailExamine = 'SELECT * FROM examine WHERE customer_id = ?';
        webService.getListTable(sqlDetailExamine ,[req.body.cus_id]).then(async responseData =>{
            console.log("getListTable", responseData);
            if(responseData.success && responseData.data && responseData.data.length >= 0){
                listExamine   = responseData.data;
                express().render(path.resolve(__dirname, "../views/examine/history.ejs"), {listExamine,moment}, (err, html) => {
                    if(err){
                        console.log("err", err);
                        resultData.message = 'Lỗi xem danh sách lịch sử khám';
                    }else{
                        resultData.success = true;
                        resultData.data = html;
                    }
                });
            }else{
                resultData.message = 'Lỗi xem danh sách lịch sử khám';
            }
            res.json(resultData);
        });
    } catch (error) {
        resultData.message = error.message;
        logService.create(req, error.message).then(function() {
            res.json(resultData);
        });
    }
});

router.post('/search/standard-weight-height', function(req, res, next){
    var resultData = {
        success: false,
        message: "",
        data: []
    };
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        let sqlPhone = 'SELECT * FROM standard_weight_height WHERE year_old = ? AND type_year_old = ? AND gender = ? ORDER BY id DESC LIMIT 1';
        webService.getListTable(sqlPhone, [req.body.year_old,req.body.type_year_old,req.body.gender]).then(responseData =>{
            if(responseData.success && responseData.data.length > 0){
                resultData.message = "Thành công";
                resultData.success = true;
                resultData.data = responseData.data;
            }else{
                resultData.message = "Tải dữ liệu thất bại!"
                resultData.data = [];
            }
            res.json(resultData);
        });
    } catch (error) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

router.post('/list/medical-test', function(req, res, next){
    try {
        var resultData = {
            success: false,
            message: '',
            data: ''
        },
        type_id = req.body.type_id,
        type_name = req.body.type_name ? req.body.type_name : '',
        medicalTestExamine = req.body.data ? JSON.parse(req.body.data) : [];
        let sqlListMedicalTest = 'SELECT * FROM medical_test WHERE type = ?';
        webService.getListTable(sqlListMedicalTest ,[type_id]).then(async responseData =>{
            console.log("medicalTest", responseData);
            if(responseData.success && responseData.data && responseData.data.length >= 0){
                let medicalTest   = responseData.data;
                console.log("medicalTest", medicalTest);
                express().render(path.resolve(__dirname, "../views/component/listmedicaltest.ejs"), {medicalTest, medicalTestExamine, type_name}, (err, html) => {
                    if(err){
                        console.log("err", err);
                        resultData.message = 'Lỗi xem danh sách chỉ định xét nghiệm';
                    }else{
                        resultData.success = true;
                        resultData.data = html;
                    }
                });
            }else{
                resultData.message = 'Lỗi xem danh sách chỉ định xét nghiệm';
            }
            res.json(resultData);
        });
    } catch (error) {
        resultData.message = error.message;
        logService.create(req, error.message).then(function() {
            res.json(resultData);
        });
    }
});

module.exports = router;