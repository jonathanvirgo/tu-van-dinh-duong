var express         = require('express'),
    router          = express.Router(),
    moment          = require('moment'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    examineService  = require('./../models/examineModel');

router.get('/', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 2).then(function(filter){
            var str_errors  = filter.error,
                arrPromise  = [],
                pageview    = [],
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
                        return logService.create(req, err).then(function(){
                            str_errors.push(err.sqlMessage);
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
                        return logService.create(req, err).then(function(){
                            str_errors.push(err.sqlMessage);
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
                    console.log("listExamine", listExamine);
                    res.render('examine/index.ejs', { 
                        user: req.user,
                        errors: str_errors,
                        listExamine: listExamine,
                        moment: moment,
                        webService: webService,
                        filter: filter,
                        paginator: paginator
                    });
                }).catch(err => {
                    res.render("examine/index.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter
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
                detailArticle: {
                    status: [],
                    article: [],
                    version: 0
                }
            };
        arrPromise.push(webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));
        arrPromise.push(articleService.getDetailArticleEdit(req.params.id).then(function(detailArticle) {
            if (detailArticle.errors.length > 0) {
                str_errors = str_errors.concat(detailArticle.errors);
            }
            if (!detailArticle.detail) {
                str_errors.push("Không tìm thấy thông tin bài viết có mã #" + req.params.id);
            } else {
                if (!req.user.role_id.includes(1) && detailArticle.detail.created_by !== req.user.id) {
                    str_errors.push("Bạn không có quyền truy cập thông tin bài #" + req.params.id);
                }
                resultData.detailArticle.status  = detailArticle.detail.search_status;
                
            }
        }));

        return new Promise(function(resolve, reject) {
            Promise.all(arrPromise).then(function() {
                res.render("examine/" + page_name + ".ejs", {
                    moment: moment,
                    user: req.user,
                    errors: str_errors,
                    filter: resultData.filter
                });
            }).catch(err => {
                res.render("examine/detail.ejs", {
                    user: req.user,
                    errors: [err],
                    filter: resultData.filter
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            res.render("examine/detail.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter
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
                filter: []
            };

        arrPromise.push(webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));

        return new Promise(function(resolve, reject) {
            Promise.all(arrPromise).then(function() {
                res.render("examine/create.ejs", {
                    user: req.user,
                    errors: str_errors,
                    filter: resultData.filter,
                    moment: moment
                });
            }).catch(err => {
                res.render("examine/create.ejs", {
                    user: req.user,
                    errors: [err],
                    filter: resultData.filter
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            res.render("examine/create.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter,
                title: e.message,
            });
        })
    }
});

router.post('/create', function(req, res, next) {
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
        console.log("create", req.body);
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
                cus_cntc:               req.body.cus_cntc,
                cus_cnht:               req.body.cus_cnht,
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
                department_id:          req.user.department_id,
                created_by:             req.user.id
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
        if (str_errors.length > 0) {
            resultData.message = str_errors.toString();
            res.json(resultData);
            return;
        } else {
            parameter.cus_birthday = parameter.cus_birthday.split("-").reverse().join("-");
            webService.addRecordTable( parameter, 'examine').then(responseData =>{
                if(!responseData.success){
                    resultData.message = responseData.message;
                    logService.create(req, responseData.message);
                }else{
                    resultData.success = true;
                    resultData.message = "Lưu phiếu khám thành công!";
                }
                res.json(resultData);
            });
            // Them khach hang vao database
            if(parameter.cus_phone){
                let sqlFindCustomer = 'SELECT * FROM customer WHERE cus_phone = ?';
                webService.getListTable(sqlFindCustomer ,[parameter.cus_phone]).then(responseData1 =>{
                    let paramCustomer = {
                        cus_name:      parameter.cus_name,
                        cus_phone:     parameter.cus_phone,
                        cus_email:     parameter.cus_email,
                        cus_gender:    parameter.cus_gender,
                        cus_birthday:  parameter.cus_birthday,
                        cus_address:   parameter.cus_address,
                        department_id: parameter.department_id 
                    };
                    if(responseData1.data && responseData1.data.length > 0){
                        let customerData = responseData1.data;
                        if(paramCustomer.cus_name !== customerData.cus_name || paramCustomer.cus_gender !== customerData.cus_gender || paramCustomer.cus_birthday !== customerData.cus_birthday){
                            // Cap nhat lai thong tin khach hang neu thay doi thong tin theo so dien thoai
                            webService.updateRecordTable(paramCustomer, {id: customerData.id}, 'customer').then(responseData2 => {
                                if(!responseData2.success){
                                    logService.create(req, responseData2.message);
                                }
                            });
                        }
                    }else{
                        // neu khong tim duoc theo so dien thoai tim theo cac thong tin khac
                        sqlFindCustomer = 'SELECT id FROM customer WHERE cus_name = ? AND cus_gender = ? AND cus_birthday = ?';
                        webService.getListTable(sqlFindCustomer ,[parameter.cus_name, parameter.cus_gender, parameter.cus_birthday]).then(responseData3=>{
                            if(responseData3.data && responseData3.data.length == 0){
                                // neu khong co khach hang thi them moi
                                webService.addRecordTable( paramCustomer, 'customer').then(responseData4 =>{
                                    if(!responseData4.success){
                                        logService.create(req, responseData4.message);
                                    }
                                })
                            }
                        });
                    }
                });
            }else{
                // neu khong co so dien thoai tim theo cac truong khac
                let sqlFindCustomer = 'SELECT id FROM customer WHERE cus_name = ? AND cus_gender = ? AND cus_birthday = ?';
                webService.getListTable(sqlFindCustomer ,[parameter.cus_name, parameter.cus_gender, parameter.cus_birthday]).then(responseData5=>{
                    if(responseData5.data && responseData5.data.length == 0){
                        // neu khong co khach hang thi them moi
                        webService.addRecordTable( paramCustomer, 'customer').then(responseData6 =>{
                            if(!responseData6.success){
                                logService.create(req, responseData6.message);
                            }
                        })
                    }
                });
            }
            return;
        }
    } catch (e) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

module.exports = router;