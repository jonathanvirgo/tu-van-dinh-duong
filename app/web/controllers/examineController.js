var express         = require('express'),
    router          = express.Router(),
    {IncomingForm}  = require("formidable"),
    path            = require('path'),
    url             = require('url'),
    fs              = require('fs'),
    moment          = require('moment'),
    request         = require('request'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    pathPublic      = "../../../";

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

            // arrPromise.push(new Promise(function (resolve, reject) {
            //     articleService.countAllArticle({search: filter.search, filter: true}, function (err, result, fields) {
            //         if (err) {
            //             return logService.create(req, err).then(function(){
            //                 str_errors.push(err.sqlMessage);
            //                 resolve();
            //             });
            //         }
            //         if (result !== undefined) {
            //             paginator.totalItem = result[0].count;
            //         }
            //         resolve();
            //     });
            // }));

            // arrPromise.push(new Promise(function (resolve, reject) {
            //     articleService.getAllArticle({search: filter.search, filter: true}, function (err, result, fields) {
            //         if (err) {
            //             return logService.create(req, err).then(function(){
            //                 str_errors.push(err.sqlMessage);
            //                 resolve();
            //             });
            //         }
            //         if (result !== undefined) {
            //             listArticle = result;
            //         }
            //         resolve();
            //     });
            // }));

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
                        listExamine: [],
                        moment: moment,
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
})

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
        var str_errors   = [],
            arrPromise   = [],
            parameter    = {
                booking_id_pr: 0,
                booking_id: parseInt(fields.booking_id),
                booking_id_add: isNaN(parseInt(fields.booking_id_add)) ? 0 : parseInt(fields.booking_id_add),
                site_id: parseInt(fields.site_id),
                fm_id: parseInt(fields.fm_id),
                channel_id: parseInt(fields.channel_id),
                book_date: fields.book_date.split("-").reverse().join("-"),
                time_from: fields.time_from,
                id_request: fields.id_request,
                status: parseInt(fields.status),
                search_status: isNaN(parseInt(fields.search_status)) ? -2 : parseInt(fields.search_status),
                post_type: fields.post_type,
                description: fields.description,
                title: fields.title,
                url_demo: fields.url_demo ? fields.url_demo : '',
                price: fields.price,
                created_by: req.user.id,
                type: fields.type,
                user_id: req.user.id,
                domain: fields.domain,
                site_name: fields.site_name,
                fm_name: fields.fm_name,
                channel_name: fields.channel_name,
                autoSave: isNaN(parseInt(fields.autoSave)) ? 0 : parseInt(fields.autoSave),
                approve: parseInt(fields.approve),
                page: fields.page,
                fieldUpdate: null,
                requestEdit: fields.requestEdit ? JSON.parse(fields.requestEdit) : ''
            };
        
        if(parameter.title == ""){
            str_errors.push("Tiêu đề không được bỏ trống!");
        }
        if(parameter.fm_id == 0){
            str_errors.push("Loại bài không được bỏ trống!");
        }
        if(parameter.channel_id == 0){
            str_errors.push("Chuyên mục không được bỏ trống!");
        }
        if (str_errors.length > 0) {
            resultData.message = str_errors.toString();
            res.json(resultData);
            return;
        } else {
            articleService.update(parameter, function(err, result, fields) {
                if (err) {
                    return logService.create(req, err).then(function() {
                        str_errors.push(err.sqlMessage);
                        resolve();
                    });
                }
                if (result == undefined) {
                    str_errors.push("Dữ liệu trả về không xác định khi cập nhật bài viết có booking" + parameter.booking_id);
                }
                resolve();
            });
        }
    } catch (e) {
        logService.create(req, e.message).then(function() {
            resultData.message = e.message;
            res.json(resultData);
        });
    }
});

module.exports = router;