var express         = require('express'),
    router          = express.Router(),
    url             = require('url'),
    path            = require('path'),
    moment          = require('moment'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    examineService  = require('./../models/examineModel');

    //1 tiếp nhận, 2 đang khám, 3 hoàn thành, 4 đã hủy

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
            },
            isDetail = req.query.detail && req.query.detail == 'true' ? true : false;

        arrPromise.push(webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));
        // lời khuyên dinh dưỡng
        let sqlNutritionAdviceList = 'SELECT * FROM nutrition_advice WHERE id > 0';
        let sqlNutritionAdviceListPermit = webService.addPermitTable(sqlNutritionAdviceList, req.user);
        arrPromise.push(webService.getListTable(sqlNutritionAdviceListPermit.sqlQuery, sqlNutritionAdviceListPermit.paramSql).then(responseData =>{
            if(responseData.success){
                resultData.nutritionAdvice = responseData.data;
            }else{
                str_errors.push(responseData.message);
            }
        }));
        // chế độ vận động sinh hoạt
        let sqlactiveModeOfLivingList = 'SELECT * FROM active_mode_of_living WHERE id > 0';
        let sqlactiveModeOfLivingListPermit = webService.addPermitTable(sqlactiveModeOfLivingList, req.user);
        arrPromise.push(webService.getListTable(sqlactiveModeOfLivingListPermit.sqlQuery, sqlactiveModeOfLivingListPermit.paramSql).then(responseData1 =>{
            if(responseData1.success){
                resultData.activeModeOfLiving = responseData1.data;
            }else{
                str_errors.push(responseData1.message);
            }
        }));
        // chi tiết phiếu khám
        arrPromise.push(examineService.getDetailExamineById(req.params.id).then(function(detailExamine) {
            if (detailExamine.success) {
                if(detailExamine.data.length == 0){
                    str_errors.push("Không tìm thấy thông tin phiếu khám có mã #" + req.params.id);
                }else{
                    if (!req.user.role_id.includes(1) && !req.user.role_id.includes(3)){
                        //Nếu là quản lý xem toàn viện
                        if(req.user.role_id.includes(5) && req.user.hospital_id !== detailExamine.data[0].hospital_id){
                            str_errors.push("Bạn không có quyền truy cập thông tin phiếu #" + req.params.id);
                        }else if(req.user.role_id.includes(4) && req.user.department_id !== detailExamine.data[0].department_id){
                            //Nếu là bác sĩ xem theo khoa
                            str_errors.push("Bạn không có quyền truy cập thông tin phiếu #" + req.params.id);
                        }else if(req.user.role_id.includes(2) && !(req.user.phone == detailExamine.data[0].cus_phone || req.user.email == detailExamine.data[0].cus_email)){
                            //Nếu là bệnh nhân xem theo số điện thoại hoặc email
                            str_errors.push("Bạn không có quyền truy cập thông tin phiếu #" + req.params.id);
                        }
                    }
                    resultData.detailExamine = detailExamine.data[0];
                }
            }else{
                str_errors = str_errors.push(detailExamine.message);
            }
        }));
        // danh sách thuốc
        let sqlMedicine = 'SELECT * FROM medicine WHERE id > 0';
        let sqlMedicinePermit = webService.addPermitTable(sqlMedicine, req.user);
        arrPromise.push(webService.getListTable(sqlMedicinePermit.sqlQuery, sqlMedicinePermit.paramSql).then(responseData2 =>{
            if(responseData2.success){
                resultData.medicine = responseData2.data;
            }else{
                str_errors.push(responseData2.message);
            }
        }));
        // chỉ định xét nghiệm
        let sqlMedicalTestType = 'SELECT * FROM medical_test_type';
        arrPromise.push(webService.getListTable(sqlMedicalTestType, []).then(responseData6 =>{
            if(responseData6.success){
                resultData.medicalTestType = responseData6.data;
            }else{
                str_errors.push(responseData6.message);
            }
        }));
        // giờ ăn
        let sqlMenuTime = 'SELECT id, time AS name FROM menu_time WHERE id > 0';
        let sqlMenuTimePermit = webService.addPermitTable(sqlMenuTime, req.user);
        arrPromise.push(webService.getListTable(sqlMenuTimePermit.sqlQuery, sqlMenuTimePermit.paramSql).then(responseData4 =>{
            if(responseData4.success){
                resultData.menuTime = responseData4.data;
            }else{
                str_errors.push(responseData4.message);
            }
        }));
        // gợi ý chuẩn đoán
        let sqlDiagnosticList = 'SELECT * FROM diagnostic WHERE id > 0';
        let sqlDiagnosticListPermit = webService.addPermitTable(sqlDiagnosticList, req.user);
        arrPromise.push(webService.getListTable(sqlDiagnosticListPermit.sqlQuery, sqlDiagnosticListPermit.paramSql).then(responseData =>{
            if(responseData.success){
                resultData.diagnostic = responseData.data;
            }else{
                str_errors.push(responseData.message);
            }
        }));
        // menu mẫu
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
                    isDetail: isDetail,
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
                isDetail: false,
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

        let sqlMedicine = 'SELECT * FROM medicine WHERE id > 0';
        let sqlMedicinePermit = webService.addPermitTable(sqlMedicine, req.user);
        arrPromise.push(webService.getListTable(sqlMedicinePermit.sqlQuery, sqlMedicinePermit.paramSql).then(responseData2 =>{
            if(responseData2.success){
                resultData.medicine = responseData2.data;
            }else{
                str_errors.push(responseData2.message);
            }
        }));

        let sqlMedicalTestType = 'SELECT * FROM medical_test_type';
        arrPromise.push(webService.getListTable(sqlMedicalTestType, []).then(responseData6 =>{
            if(responseData6.success){
                resultData.medicalTestType = responseData6.data;
            }else{
                str_errors.push(responseData6.message);
            }
        }));

        let sqlMenuTime = 'SELECT id, time AS name FROM menu_time WHERE id > 0';
        let sqlMenuTimePermit = webService.addPermitTable(sqlMenuTime, req.user);
        arrPromise.push(webService.getListTable(sqlMenuTimePermit.sqlQuery, sqlMenuTimePermit.paramSql).then(responseData4 =>{
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
                    examine:{status: 1},
                    activeModeOfLiving: resultData.activeModeOfLiving,
                    nutritionAdvice: resultData.nutritionAdvice,
                    medicine: resultData.medicine,
                    isDetail: false,
                    medicalTestType: resultData.medicalTestType,
                    medicalTestExamine: [],
                    prescriptionExamine: [],
                    menuExamine: [],
                    menuExample: resultData.menuExample,
                    menuTime:resultData.menuTime,
                    link:'examine-page',
                    diagnostic: resultData.diagnostic
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
                isDetail: false,
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
                department_id:          req.user.department_id,
                hospital_id:            req.user.hospital_id,
                created_by:             req.user.id,
                reportdate:             new Date().toLocaleDateString('fr-CA')
            },
            id_examine = '';
        
        if(req.body.cus_name)               parameter['cus_name']               = req.body.cus_name;
        if(req.body.cus_phone)              parameter['cus_phone']              = req.body.cus_phone;
        if(req.body.cus_email)              parameter['cus_email']              = req.body.cus_email;
        if(req.body.cus_gender)             parameter['cus_gender']             = req.body.cus_gender;
        if(req.body.cus_birthday)           parameter['cus_birthday']           = req.body.cus_birthday;
        if(req.body.cus_address)            parameter['cus_address']            = req.body.cus_address;
        if(req.body.cus_anamnesis)          parameter['cus_anamnesis']          = req.body.cus_anamnesis;
        if(req.body.cus_living_habits)      parameter['cus_living_habits']      = req.body.cus_living_habits;
        if(req.body.diagnostic)             parameter['diagnostic']             = req.body.diagnostic;
        if(req.body.cus_length)             parameter['cus_length']             = req.body.cus_length;
        if(req.body.cus_cctc)               parameter['cus_cctc']               = req.body.cus_cctc;
        if(req.body.cus_cntc)               parameter['cus_cntc']               = req.body.cus_cntc;
        if(req.body.cus_cnht)               parameter['cus_cnht']               = req.body.cus_cnht;
        if(req.body.cus_cnbt)               parameter['cus_cnbt']               = req.body.cus_cnbt;
        if(req.body.cus_bmi)                parameter['cus_bmi']                = req.body.cus_bmi;
        if(req.body.cus_ncdd)               parameter['cus_ncdd']               = req.body.cus_ncdd;
        if(req.body.cus_height_by_age)      parameter['cus_height_by_age']      = req.body.cus_height_by_age;
        if(req.body.cus_weight_by_age)      parameter['cus_weight_by_age']      = req.body.cus_weight_by_age;
        if(req.body.cus_bmi_by_age)         parameter['cus_bmi_by_age']         = req.body.cus_bmi_by_age;
        if(req.body.cus_height_by_weight)   parameter['cus_height_by_weight']   = req.body.cus_height_by_weight;
        if(req.body.clinical_examination)   parameter['clinical_examination']   = req.body.clinical_examination;
        if(req.body.erythrocytes)           parameter['erythrocytes']           = req.body.erythrocytes;
        if(req.body.cus_bc)                 parameter['cus_bc']                 = req.body.cus_bc;
        if(req.body.cus_tc)                 parameter['cus_tc']                 = req.body.cus_tc;
        if(req.body.cus_albumin)            parameter['cus_albumin']            = req.body.cus_albumin;
        if(req.body.cus_nakcl)              parameter['cus_nakcl']              = req.body.cus_nakcl;
        if(req.body.cus_astaltggt)          parameter['cus_astaltggt']          = req.body.cus_astaltggt;
        if(req.body.cus_urecreatinin)       parameter['cus_urecreatinin']       = req.body.cus_urecreatinin;
        if(req.body.cus_bilirubin)          parameter['cus_bilirubin']          = req.body.cus_bilirubin;
        if(req.body.exa_note)               parameter['exa_note']               = req.body.exa_note;
        if(req.body.cus_fat)                parameter['cus_fat']                = req.body.cus_fat;
        if(req.body.cus_water)              parameter['cus_water']              = req.body.cus_water;
        if(req.body.cus_visceral_fat)       parameter['cus_visceral_fat']       = req.body.cus_visceral_fat;
        if(req.body.cus_bone_weight)        parameter['cus_bone_weight']        = req.body.cus_bone_weight;
        if(req.body.cus_chcb)               parameter['cus_chcb']               = req.body.cus_chcb;
        if(req.body.cus_waist)              parameter['cus_waist']              = req.body.cus_waist;
        if(req.body.cus_butt)               parameter['cus_butt']               = req.body.cus_butt;
        if(req.body.cus_cseomong)           parameter['cus_cseomong']           = req.body.cus_cseomong;
        if(req.body.active_mode_of_living)  parameter['active_mode_of_living']  = req.body.active_mode_of_living;
        if(req.body.glucid_should_use)      parameter['glucid_should_use']      = req.body.glucid_should_use;
        if(req.body.glucid_limited_use)     parameter['glucid_limited_use']     = req.body.glucid_limited_use;
        if(req.body.glucid_should_not_use)  parameter['glucid_should_not_use']  = req.body.glucid_should_not_use;
        if(req.body.protein_should_use)     parameter['protein_should_use']     = req.body.protein_should_use;
        if(req.body.protein_limited_use)    parameter['protein_limited_use']    = req.body.protein_limited_use;
        if(req.body.protein_should_not_use) parameter['protein_should_not_use'] = req.body.protein_should_not_use;
        if(req.body.lipid_should_use)       parameter['lipid_should_use']       = req.body.lipid_should_use;
        if(req.body.lipid_limited_use)      parameter['lipid_limited_use']      = req.body.lipid_limited_use;
        if(req.body.lipid_should_not_use)   parameter['lipid_should_not_use']   = req.body.lipid_should_not_use;
        if(req.body.vitamin_ck_should_use)  parameter['vitamin_ck_should_use']  = req.body.vitamin_ck_should_use;
        if(req.body.vitamin_ck_limited_use) parameter['vitamin_ck_limited_use'] = req.body.vitamin_ck_limited_use;
        if(req.body.vitamin_ck_should_not_use) parameter['vitamin_ck_should_not_use'] = req.body.vitamin_ck_should_not_use;
        if(req.body.nutrition_advice_id)    parameter['nutrition_advice_id']    = req.body.nutrition_advice_id;
        if(req.body.active_mode_of_living_id) parameter['active_mode_of_living_id'] = req.body.active_mode_of_living_id;
        if(req.body.medical_test)           parameter['medical_test']           = req.body.medical_test;
        if(req.body.prescription)           parameter['prescription']           = req.body.prescription;
        if(req.body.menu_example)           parameter['menu_example']           = req.body.menu_example;
        if(req.body.action)                 parameter['status']                 = req.body.action;
        
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
            parameter    = {};

        if(req.body.cus_name)               parameter['cus_name']               = req.body.cus_name;
        if(req.body.cus_phone)              parameter['cus_phone']              = req.body.cus_phone;
        if(req.body.cus_email)              parameter['cus_email']              = req.body.cus_email;
        if(req.body.cus_gender)             parameter['cus_gender']             = req.body.cus_gender;
        if(req.body.cus_birthday)           parameter['cus_birthday']           = req.body.cus_birthday;
        if(req.body.cus_address)            parameter['cus_address']            = req.body.cus_address;
        if(req.body.cus_anamnesis)          parameter['cus_anamnesis']          = req.body.cus_anamnesis;
        if(req.body.cus_living_habits)      parameter['cus_living_habits']      = req.body.cus_living_habits;
        if(req.body.diagnostic)             parameter['diagnostic']             = req.body.diagnostic;
        if(req.body.cus_length)             parameter['cus_length']             = req.body.cus_length;
        if(req.body.cus_cctc)               parameter['cus_cctc']               = req.body.cus_cctc;
        if(req.body.cus_cntc)               parameter['cus_cntc']               = req.body.cus_cntc;
        if(req.body.cus_cnht)               parameter['cus_cnht']               = req.body.cus_cnht;
        if(req.body.cus_cnbt)               parameter['cus_cnbt']               = req.body.cus_cnbt;
        if(req.body.cus_bmi)                parameter['cus_bmi']                = req.body.cus_bmi;
        if(req.body.cus_ncdd)               parameter['cus_ncdd']                = req.body.cus_ncdd;
        if(req.body.cus_height_by_age)      parameter['cus_height_by_age']      = req.body.cus_height_by_age;
        if(req.body.cus_weight_by_age)      parameter['cus_weight_by_age']      = req.body.cus_weight_by_age;
        if(req.body.cus_bmi_by_age)         parameter['cus_bmi_by_age']         = req.body.cus_bmi_by_age;
        if(req.body.cus_height_by_weight)   parameter['cus_height_by_weight']   = req.body.cus_height_by_weight;
        if(req.body.clinical_examination)   parameter['clinical_examination']   = req.body.clinical_examination;
        if(req.body.erythrocytes)           parameter['erythrocytes']           = req.body.erythrocytes;
        if(req.body.cus_bc)                 parameter['cus_bc']                 = req.body.cus_bc;
        if(req.body.cus_tc)                 parameter['cus_tc']                 = req.body.cus_tc;
        if(req.body.cus_albumin)            parameter['cus_albumin']            = req.body.cus_albumin;
        if(req.body.cus_nakcl)              parameter['cus_nakcl']              = req.body.cus_nakcl;
        if(req.body.cus_astaltggt)          parameter['cus_astaltggt']          = req.body.cus_astaltggt;
        if(req.body.cus_urecreatinin)       parameter['cus_urecreatinin']       = req.body.cus_urecreatinin;
        if(req.body.cus_bilirubin)          parameter['cus_bilirubin']          = req.body.cus_bilirubin;
        if(req.body.exa_note)               parameter['exa_note']               = req.body.exa_note;
        if(req.body.cus_fat)                parameter['cus_fat']                = req.body.cus_fat;
        if(req.body.cus_water)              parameter['cus_water']              = req.body.cus_water;
        if(req.body.cus_visceral_fat)       parameter['cus_visceral_fat']       = req.body.cus_visceral_fat;
        if(req.body.cus_bone_weight)        parameter['cus_bone_weight']        = req.body.cus_bone_weight;
        if(req.body.cus_chcb)               parameter['cus_chcb']               = req.body.cus_chcb;
        if(req.body.cus_waist)              parameter['cus_waist']              = req.body.cus_waist;
        if(req.body.cus_butt)               parameter['cus_butt']               = req.body.cus_butt;
        if(req.body.cus_cseomong)           parameter['cus_cseomong']           = req.body.cus_cseomong;
        if(req.body.active_mode_of_living)  parameter['active_mode_of_living']  = req.body.active_mode_of_living;
        if(req.body.glucid_should_use)      parameter['glucid_should_use']      = req.body.glucid_should_use;
        if(req.body.glucid_limited_use)     parameter['glucid_limited_use']     = req.body.glucid_limited_use;
        if(req.body.glucid_should_not_use)  parameter['glucid_should_not_use']  = req.body.glucid_should_not_use;
        if(req.body.protein_should_use)     parameter['protein_should_use']     = req.body.protein_should_use;
        if(req.body.protein_limited_use)    parameter['protein_limited_use']    = req.body.protein_limited_use;
        if(req.body.protein_should_not_use) parameter['protein_should_not_use'] = req.body.protein_should_not_use;
        if(req.body.lipid_should_use)       parameter['lipid_should_use']       = req.body.lipid_should_use;
        if(req.body.lipid_limited_use)      parameter['lipid_limited_use']      = req.body.lipid_limited_use;
        if(req.body.lipid_should_not_use)   parameter['lipid_should_not_use']   = req.body.lipid_should_not_use;
        if(req.body.vitamin_ck_should_use)  parameter['vitamin_ck_should_use']  = req.body.vitamin_ck_should_use;
        if(req.body.vitamin_ck_limited_use) parameter['vitamin_ck_limited_use'] = req.body.vitamin_ck_limited_use;
        if(req.body.vitamin_ck_should_not_use) parameter['vitamin_ck_should_not_use'] = req.body.vitamin_ck_should_not_use;
        if(req.body.nutrition_advice_id)    parameter['nutrition_advice_id']    = req.body.nutrition_advice_id;
        if(req.body.active_mode_of_living_id) parameter['active_mode_of_living_id'] = req.body.active_mode_of_living_id;
        if(req.body.medical_test)           parameter['medical_test']           = req.body.medical_test;
        if(req.body.prescription)           parameter['prescription']           = req.body.prescription;
        if(req.body.menu_example)           parameter['menu_example']           = req.body.menu_example;
        if(req.body.action)                 parameter['status']                 = req.body.action;

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
        let sqlPhone = 'SELECT * FROM customer WHERE cus_phone LIKE ? OR cus_name LIKE ?';
        webService.getListTable(sqlPhone, ['%' + req.query.term + '%', '%' + req.query.term + '%']).then(responseData =>{
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
        let sqlDetailExamine = 'SELECT * FROM examine WHERE customer_id = ?';
        webService.getListTable(sqlDetailExamine ,[req.body.cus_id]).then(async responseData =>{
            if(responseData.success && responseData.data && responseData.data.length >= 0){
                listExamine   = responseData.data;
                express().render(path.resolve(__dirname, "../views/examine/history.ejs"), {listExamine,moment}, (err, html) => {
                    if(err){
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
        data: {}
    };
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        let param = {
            year_old: req.body.year_old ? req.body.year_old : '',
            type_year_old: req.body.type_year_old,
            gender: req.body.gender
        };
        let str_error = [];
        if(!req.body.year_old){
            str_error.push("Thiếu ngày sinh!");
        }
        if(!req.body.gender || !['0', '1'].includes(param.gender)){
            str_error.push("Thiếu giởi tính!");
        }
        if(!req.body.type_year_old){
            str_error.push("Thiếu đơn vị tuổi!");
        }
        if (str_error.length > 0) {
            resultData.message = str_error.toString();
            res.json(resultData);
            return;
        }
        let arrPromise = [];
        param['age'] = param.type_year_old == '0' ? (parseInt(param.year_old) / 12) : parseInt(param.year_old);
        param['age_month'] = param.type_year_old == '1' ? (parseInt(param.year_old) * 12) : parseInt(param.year_old);
        if(param.age <= 18){
            arrPromise.push(new Promise((resolve, reject) => {
                let sqlStandardWeightHeight = 'SELECT weight,height FROM standard_weight_height WHERE year_old = ? AND type_year_old = ? AND gender = ? ORDER BY id DESC LIMIT 1';
                webService.getListTable(sqlStandardWeightHeight, [param.year_old,param.type_year_old,param.gender]).then(responseData =>{
                    if(responseData.success){
                        if(responseData.data.length > 0){
                            resultData.data['weight'] = responseData.data[0].weight;
                            resultData.data['height'] = responseData.data[0].height;
                        }
                    }else{
                        str_error.push(responseData.message);
                    }
                    resolve();
                });
            }))
        }
        
        if(param.age >= 0.5){
            arrPromise.push(new Promise((resolve, reject) => {
                let sqlnutritionalNeeds = 'SELECT content FROM nutritional_needs WHERE gender = ? AND age_min <= ? AND age_max > ?';
                webService.getListTable(sqlnutritionalNeeds, [param.gender,param.age, param.age]).then(responseData1 =>{
                    if(responseData1.success){
                        if(responseData1.data.length > 0){
                            resultData.data['contentNCDD'] = responseData1.data[0].content;
                        }
                    }else{
                        str_error.push(responseData1.message);
                    }
                    resolve();
                })
            }))
        }
        if(param.age_month <= 227){
            arrPromise.push(new Promise((resolve, reject) => {
                let sqlIndexByAge = 'SELECT * FROM index_by_age WHERE gender = ? AND age = ?';
                webService.getListTable(sqlIndexByAge, [param.gender,param.age_month]).then(responseData2 =>{
                    if(responseData2.success){
                        if(responseData2.data.length > 0){
                            resultData.data['height_min'] = responseData2.data[0].height_min;
                            resultData.data['height_max'] = responseData2.data[0].height_max;
                            resultData.data['weight_min'] = responseData2.data[0].weight_min;
                            resultData.data['weight_max'] = responseData2.data[0].weight_max;
                            resultData.data['bmi_min'] = responseData2.data[0].bmi_min;
                            resultData.data['bmi_max'] = responseData2.data[0].bmi_max;
                        }
                    }else{
                        str_error.push(responseData2.message);
                    }
                    resolve();
                })
            }));
        }
        let cus_length = isNaN(parseFloat(req.body.cus_length)) ? null : parseFloat(req.body.cus_length).toFixed(3) * 100;
        if(cus_length){
            //Làm tròn chiều cao đến 0.5
            cus_length = webService.roundStep(cus_length, 0.5);
            arrPromise.push(new Promise((resolve, reject) => {
                let sqlnutritionalNeeds = 'SELECT weight_min, weight_max FROM height_by_weight WHERE gender = ? AND height = ?';
                webService.getListTable(sqlnutritionalNeeds, [param.gender, cus_length]).then(responseData3 =>{
                    if(responseData3.success){
                        if(responseData3.data.length > 0){
                            resultData.data['weight_height_min'] = responseData3.data[0].weight_min;
                            resultData.data['weight_height_max'] = responseData3.data[0].weight_max;
                        }
                    }else{
                        str_error.push(responseData3.message);
                    }
                    resolve();
                })
            }));
        }
        
        Promise.all(arrPromise).then(()=>{
            if(str_error.length > 0){
                resultData.message = str_error.toString();
            }else{
                resultData.message = "Thành công";
                resultData.success = true;
            }
            res.json(resultData);
        })
    } catch (error) {
        console.log('error', error);
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
        medicalTestExamine = req.body.data ? JSON.parse(req.body.data) : [],
        isLockInput = req.body.isLockInput ? (req.body.isLockInput == 'true' ? true: false) : false;
        let sqlListMedicalTest = 'SELECT * FROM medical_test WHERE type = ?';
        webService.getListTable(sqlListMedicalTest ,[type_id]).then(async responseData =>{
            if(responseData.success && responseData.data && responseData.data.length >= 0){
                let medicalTest   = responseData.data;
                express().render(path.resolve(__dirname, "../views/component/listmedicaltest.ejs"), {medicalTest, medicalTestExamine, type_name, isLockInput}, (err, html) => {
                    if(err){
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

router.post('/cancel', async function(req, res, next){
    var resultData = {
        success: false,
        message: ''
    };
    try {  
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }
        let id      = req.body.id,
            status  = req.body.status;
        if(!id){
            resultData.message = "Thiếu id phiếu khám!";
            res.json(resultData);
            return;
        }else{
            let param = {};
            if(status && status == 4){
                param['active'] = 0;
            }else{
                param['status'] = 4;
            }
            let responseData = await webService.updateRecordTable( param, {id: id}, 'examine');
            // data: OkPacket {
            //     fieldCount: 0,
            //     affectedRows: 1,
            //     insertId: 0,
            //     serverStatus: 2,
            //     warningCount: 0,
            //     message: '(Rows matched: 1  Changed: 1  Warnings: 0',
            //     protocol41: true,
            //     changedRows: 1
            // }
            if(responseData.success && responseData.data && responseData.data.changedRows == 1){
                resultData.message = 'Thành công!';
                resultData.success = true;
            }else{
                resultData.message = responseData.message;
            }
            res.json(resultData);
        }
    } catch (error) {
        
    }
});

router.post('/list/department', function(req, res, next){
    try {
        var resultData = {
            success: false,
            message: '',
            data: []
        },
        hospital_id = req.body.hospital_id;
        
        let sqlListDepartment = 'SELECT id, `name` FROM department WHERE hospital_id = ? AND active = 1 ';
        webService.getListTable(sqlListDepartment ,[hospital_id]).then(async responseData =>{
            if(responseData.success && responseData.data && responseData.data.length >= 0){
                resultData.success = true;
                resultData.data   = responseData.data;
            }else{
                resultData.message = 'Lỗi lấy danh sách khoa';
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

// router.get('/add-report-date', (req, res, next) =>{
//     try {
//         var resultData = {
//             success: false,
//             message: '',
//             data: ''
//         };
//         let sqlListContent = 'SELECT id FROM examine';
//         webService.getListTable(sqlListContent ,[]).then(async responseData =>{
//             if(responseData.success && responseData.data && responseData.data.length > 0){
//                 for(let item of responseData.data){
//                     let sqlDetailContent = 'SELECT content FROM pr_article_content WHERE id = ?';
//                     articleService.getListTable(sqlDetailContent, [item.id]).then(async responseData1 =>{
//                         if(responseData1.success && responseData1.data && responseData1.data.length > 0){
//                             let content = encodeURIComponent(responseData1.data[0].content);
//                             articleService.updateRecordTable({content: content}, {id: item.id}, 'pr_article_content');
//                         }
//                     });
                    
//                 }
//                 resultData.success = true;
//             }else{
//                 resultData.message = 'Lỗi lấy danh sách content';
//             }
//             res.json(resultData);
//         });
//     } catch (error) {
        
//     }
// });

module.exports = router;