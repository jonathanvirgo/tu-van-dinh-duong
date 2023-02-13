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
        webService.createSideBarFilter(req, 2).then(function(filter){
            var str_errors  = filter.error,
                arrPromise  = [],
                pageview    = [],
                listArticle = [],
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
                articleService.countAllArticle({search: filter.search, filter: true}, function (err, result, fields) {
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
                articleService.getAllArticle({search: filter.search, filter: true}, function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(){
                            str_errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    if (result !== undefined) {
                        listArticle = result;
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
                    res.render('article/index.ejs', { 
                        user: req.user,
                        errors: str_errors,
                        listArticle: listArticle,
                        moment: moment,
                        webService: webService,
                        filter: filter,
                        paginator: paginator
                    });
                }).catch(err => {
                    res.render("article/index.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter
                    });
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            res.render("article/index.ejs", {
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
        var artPromise       = [],
            arrPromise       = [],
            str_errors       = [],
            channelAllowId   = [],
            channelAllow     = [],
            channelAllowName = [],
            listRequestCancel = [],
            listRequestEdit = [],
            listRequest     = [],
            page_name        = "edit",
            resultData       = {
                filter: [],
                category: [],
                bookings: [],
                times:[],
                detailArticle: {
                    status: [],
                    article: [],
                    file: [],
                    content: "",
                    version: 0,
                    isLockPublish: false
                }
            };
        artPromise.push(webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));
        artPromise.push(articleService.getDetailArticleEdit(req.params.id).then(function(detailArticle) {
            if (detailArticle.errors.length > 0) {
                str_errors = str_errors.concat(detailArticle.errors);
            }
            if (!detailArticle.detail) {
                str_errors.push("Không tìm thấy thông tin bài viết có mã #" + req.params.id);
            } else {
                if (!req.user.role_id.includes(1) && detailArticle.detail.created_by !== req.user.id) {
                    str_errors.push("Bạn không có quyền truy cập thông tin bài #" + req.params.id);
                }
                var price_allow  = detailArticle.detail.price_allow;
                resultData.detailArticle.status  = detailArticle.detail.search_status;
                resultData.detailArticle.article = detailArticle.detail;
                resultData.detailArticle.content = detailArticle.content;
                resultData.detailArticle.file    = detailArticle.file;
                if(detailArticle.content.length > 0){
                    resultData.detailArticle.version = detailArticle.content[0].version;
                }
                if(detailArticle.detail.list_channel_allow){
                    channelAllowId = JSON.parse(detailArticle.detail.list_channel_allow);
                }

                arrPromise.push(new Promise(function(resolve, reject) {
                    if(req.query.booking_id && req.query.booking_id > 0){
                        resultData.detailArticle.article['booking_id_add'] = req.query.booking_id;
                    }
                    bookingService.getListBookingForPublish(resultData.detailArticle.article, req.user, function(err, result, fields) {
                        if (err) {
                            return logService.create(req, err).then(function() {
                                str_errors.push(err.sqlMessage);
                                resolve();
                            });
                        }
                        if (result !== undefined) {
                            for (var i = 0; i < result.length; i++) {
                                var date_now  = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
                                var book_time = moment(result[i].book_date).format('YYYY-MM-DD') + " " + result[i].time_from;
                                //str_errors.push(result[i].id + ' date ' + date_now + ' -- '+ book_time);
                                if(book_time > date_now){
                                    resultData.bookings.push({
                                        id: result[i].id,
                                        fm_id: result[i].fm_id,
                                        channel_id: result[i].channel_id,
                                        time_from: result[i].time_from,
                                        booking_id_pr: result[i].booking_id_pr,
                                        book_date: moment(result[i].book_date).format('DD-MM-YYYY'),
                                        name: "#" + result[i].booking_id_pr + "-" + result[i].domaingroup + " | " + result[i].time_from + " | " + moment(result[i].book_date).format('DD-MM-YYYY') + " | " + result[i].channel_name + " | " + result[i].fm_name + " | " + result[i].price,
                                    });
                                }   
                            }
                        }
                        resolve();
                    });
                }));

                arrPromise.push(webService.getListWebsiteChannelFormat(req, resultData.detailArticle.article.site_id).then(function(dataCategory) {
                    resultData.category = dataCategory;
                    if (resultData.category.error.length > 0) {
                        str_errors = str_errors.concat(resultData.category.error);
                    }
                    // if(price_allow > 0){
                    //     var list_formats = [];
                    //     for (var [i, format] of resultData.category.formats.entries()){
                    //         if(format.price <= price_allow){
                    //             list_formats.push(format);
                    //         }
                    //     }
                    //     resultData.category.formats = list_formats;
                    // }
                }));

                arrPromise.push(webService.getTimeFromToolPR(req, resultData.detailArticle.article.channel_id, webService.parseDay(resultData.detailArticle.article.book_date)).then(function(resultTime) {
                    resultData.times = resultTime.time;
                }));
                if(resultData.detailArticle.article.search_status && resultData.detailArticle.article.search_status == 2){
                    let sqlCountRequestEdit = 'SELECT COUNT(id) AS total FROM pr_history_article WHERE `type` = 2 AND request_type = 1 AND active = 1 AND `status` = 1 AND booking_id = ?';
                    arrPromise.push(articleService.getListTable(sqlCountRequestEdit ,[req.params.id]).then(responseData =>{
                        if(!responseData.success){
                            str_errors.push(responseData.message);
                        }
                        if(responseData.data && responseData.data.length > 0){
                            if(responseData.data[0].total > 0){
                                resultData.detailArticle.isLockPublish = true;
                            }
                        }
                    }));
                }
            }
        }));
        let sqlGetListRequest = 'SELECT * FROM pr_history_article WHERE booking_id = ? AND active = 1 ORDER BY id DESC';
        arrPromise.push(articleService.getListTable(sqlGetListRequest ,[req.params.id]).then(responseData =>{
            if(!responseData.success){
                str_errors.push(responseData.message);
            }
            if(responseData.data && responseData.data.length > 0){
                listRequestCancel   = responseData.data.filter(s => s.request_type == 2);
                listRequestEdit     = responseData.data.filter(s => s.request_type == 1);
                listRequest         = responseData.data;
            }
        }));

        return new Promise(function(resolve, reject) {
            Promise.all(artPromise).then(function() {
                Promise.all(arrPromise).then(function() {
                    var listChannels = webService.sortChannelForVirtualSelect(resultData.category.channels);
                    // if (channelAllowId.length > 0) {
                    //     for (var i = 0; i < listChannels.length; i++) {
                    //         if (channelAllowId.includes(listChannels[i].value.toString())){
                    //             channelAllow.push(listChannels[i]);
                    //             channelAllowName.push(listChannels[i].label);
                    //         }
                    //     }
                    // }
                    res.render("article/" + page_name + ".ejs", {
                        moment: moment,
                        page: page_name,
                        user: req.user,
                        errors: str_errors,
                        filter: resultData.filter,
                        websites: resultData.category.websites,
                        formats: resultData.category.formats,
                        times: resultData.times,
                        // channels: channelAllow.length > 0 ? channelAllow : listChannels,
                        channels: listChannels,
                        bookings: resultData.bookings,
                        channelAllowId: channelAllowId,
                        // channelAllowName: channelAllowName,
                        article: resultData.detailArticle.article ? resultData.detailArticle.article : null,
                        title: resultData.detailArticle.article ? resultData.detailArticle.article.id_request : '',
                        content: resultData.detailArticle.content,
                        files: resultData.detailArticle.file,
                        statusClass: webService.bookingStatusClass(resultData.detailArticle.status),
                        bookingPostType: webService.bookingPostType(resultData.detailArticle.article ? resultData.detailArticle.article.post_type : 'default'),
                        listRequestCancel: listRequestCancel,
                        listRequestEdit: listRequestEdit,
                        listRequest: listRequest,
                        versionContent: resultData.detailArticle.version,
                        price_allow_fm: new Intl.NumberFormat('en-US').format(resultData.detailArticle.article ? resultData.detailArticle.article.price_allow : 0),
                        isLockPublish: resultData.detailArticle.isLockPublish,
                        price_article: (resultData.detailArticle.article && resultData.detailArticle.article.price) ? parseInt(resultData.detailArticle.article.price.replaceAll(',','')) : 0
                    });
                }).catch(err => {
                    res.render("article/detail.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: resultData.filter,
                        title: err
                    });
                });
            }).catch(err => {
                res.render("article/detail.ejs", {
                    user: req.user,
                    errors: [err],
                    filter: resultData.filter,
                    title: err
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            res.render("article/detail.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter,
                title: e.message
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
                category: []
            },
            article = {
                booking_id: 0,
                status: -2,
                type: 1,
                id_request: "",
                list_channel_allow: '[]',
                search_status: -2
            }
            query   = url.parse(req.url, true).query,
            site_id = query.site_id == undefined ? 1 : query.site_id;

        arrPromise.push(new Promise((resolve, reject) => {
            bookingService.checkDraftBooking(req.user.id).then(function(responseData) {
                if (!responseData.success) {
                    str_errors.push(responseData.message);
                    resolve();
                } else {
                    if (responseData.data[0]) {
                        article.booking_id = responseData.data[0].booking_id;
                        article.id_request = responseData.data[0].id_request;
                        articleService.updateRecordTable("created_at = CURRENT_TIMESTAMP",{booking_id: responseData.data[0].booking_id}, 'pr_article');
                        resolve();
                    } else {
                        bookingService.createDraftBooking({
                            created_by: req.user.id
                        }).then(function(responseData_1) {
                            if (!responseData_1.success) {
                                str_errors.push(responseData_1.message);
                                resolve();
                            } else {
                                if (responseData_1.data.insertId !== undefined) {
                                    article.booking_id = responseData_1.data.insertId;
                                    articleService.createDraftArticle(article.booking_id).then(function(responseData_2) {
                                        if (!responseData_2.success) {
                                            str_errors.push(responseData_2.message);
                                        }
                                        article.id_request = responseData_2.id_request;
                                        resolve();
                                    });
                                } else {
                                    resolve();
                                }
                            }
                        });
                    }
                }
            });
        }));

        arrPromise.push(webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));
        arrPromise.push(webService.getListWebsiteChannelFormat(req, site_id).then(function(dataCategory) {
            resultData.category = dataCategory;
            if (resultData.category.error.length > 0) {
                str_errors = str_errors.concat(resultData.category.error);
            }
        }));

        return new Promise(function(resolve, reject) {
            Promise.all(arrPromise).then(function() {
                res.render("article/create.ejs", {
                    page: "create",
                    user: req.user,
                    errors: str_errors,
                    filter: resultData.filter,
                    websites: resultData.category.websites,
                    formats: resultData.category.formats,
                    channels: webService.sortChannelForVirtualSelect(resultData.category.channels),
                    statusClass: webService.bookingStatusClass(article.search_status),
                    article: article,
                    title: article.id_request,
                    content: [],
                    files: [],
                    listRequestCancel: [],
                    listRequestEdit: [],
                    listRequest: [],
                    versionContent: 0,
                    moment: moment,
                    price_allow_fm: "0"
                });
            }).catch(err => {
                res.render("article/create.ejs", {
                    user: req.user,
                    errors: [err],
                    filter: resultData.filter,
                    title: err,
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 2).then(function(dataFilter) {
            res.render("article/create.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter,
                title: e.message,
            });
        })
    }
});

module.exports = router;