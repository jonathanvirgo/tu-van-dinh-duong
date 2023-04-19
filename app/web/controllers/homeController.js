var express         = require('express'),
    router          = express.Router(),
    moment          = require('moment'),
    request         = require('request'),
    url             = require('url'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    examineService  = require('./../models/examineModel');

router.get('/', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 0, 5).then(function(filter){
            var str_errors   = filter.error,
                datesRange   = getDatesRangeArray(filter.search.fromdate, filter.search.todate),
                arrPromise   = [],
                listExamine  = [],
                countExamine = 0,
                chartNews    = {
                    datetime:[],
                    label: [],
                    news: [],
                    max_news: 0,
                    pageview: 0,
                    max_pageview: 0
                },
                statsByStatus = {
                    post1: 0,
                    post2: 0,
                    post3: 0,
                    post4: 0
                };
            arrPromise.push(new Promise(function (resolve, reject) {
                examineService.countAllExamine({search: filter.search, filter: false}, function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(responseData){
                            if(responseData.message) str_errors.push(responseData.message);
                            else str_errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    if (result !== undefined) {
                        countExamine = result[0].count;
                    }
                    resolve();
                });
            }));

            arrPromise.push(new Promise(function (resolve, reject) {
                examineService.getAllExamine({search: filter.search, filter: false}, function (err, result, fields) {
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
                    if(listExamine.length > 0){
                        for(let examine of listExamine){
                            //1: Tiếp nhận, 2: Đang khám, 3: Hoàn thành, 4: Đã hủy
                            if(examine.status == 1){
                                statsByStatus.post1 += 1;
                            }
                            if(examine.status == 2){
                                statsByStatus.post2 += 1;
                            }
                            if(examine.status == 3){
                                statsByStatus.post3 += 1;
                            }
                            if(examine.status == 4){
                                statsByStatus.post4 += 1;
                            }
                        }
                    }
                    resolve();
                });
            }));

            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    res.render('home/index.ejs', { 
                        user: req.user,
                        errors: str_errors,
                        listExamine: listExamine,
                        countExamine: countExamine,
                        moment: moment,
                        webService: webService,
                        filter: filter,
                        chartNews: chartNews,
                        statsByStatus: statsByStatus,
                        link:'dashboard'
                    });
                }).catch(err => {
                    res.render("home/index.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter,
                        link:'dashboard'
                    });
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 0).then(function(dataFilter) {
            res.render("home/index.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter
            });
        })
    }
})

router.get('/search', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 3).then(function(filter){
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
        webService.createSideBarFilter(req, 0).then(function(dataFilter) {
            res.render("examine/index.ejs", {
                user: req.user,
                errors: [e.message]
            });
        })
    }
})

router.get('/lien-he', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 0).then(function(filter){
            var str_errors   = filter.error,
                arrPromise   = [];

           
            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    res.render('pages/contact.ejs', { 
                        user: req.user,
                        errors: str_errors,
                        filter: filter
                    });
                }).catch(err => {
                    res.render("pages/contact.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter
                    });
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            res.render("pages/contact.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter
            });
        })
    }
})

function getDatesRangeArray(startDate, endDate) {
    var start = new Date(startDate.split("-").reverse().join("-"));
    var end   = new Date(endDate.split("-").reverse().join("-"));
    for(var arr = [],dt = new Date(start); dt <= new Date(end); dt.setDate(dt.getDate() + 1)){
        arr.push(new Date(dt));
    }
    return arr;
}
module.exports = router;
