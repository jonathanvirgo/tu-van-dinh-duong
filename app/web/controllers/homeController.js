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
        webService.createSideBarFilter(req, 0, 10).then(function(filter){
            var str_errors       = filter.error,
                query            = url.parse(req.url, true).query,
                paging_type      = query.paging_type == undefined ? 0 : parseInt(query.paging_type),
                current_page     = query.page == undefined ? 0 : parseInt(query.page),
                arrPromise       = [],
                listArticle      = [],
                listBooking      = [],
                paginatorBooking = {
                    perPage: 0,
                    page: 0,
                    totalItem: 0,
                    totalPage: 0,
                    hasPrevPage: false,
                    hasNextPage: false,
                    nextPage: '',
                    prevPage: '',
                    currentPage: '',
                },
                paginatorArticle = {
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
            if([0,1].includes(current_page)){
                paging_type = 0;
            }

            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    if([0,1].includes(paging_type)){
                        paginatorArticle.page          = filter.search.page;
                        paginatorArticle.perPage       = filter.search.take;
                        paginatorArticle.currentPage   = filter.requestUri;
                        paginatorArticle.totalPage     = Math.ceil(paginatorArticle.totalItem / paginatorArticle.perPage);
                        if (paginatorArticle.totalPage > paginatorArticle.page) {
                            paginatorArticle.hasNextPage = true;
                            paginatorArticle.nextPage    = filter.requestUri + '&paging_type=1&page=' + (paginatorArticle.page + 1);
                        }
                        if (paginatorArticle.page >= 2) {
                            paginatorArticle.hasPrevPage = true;
                            paginatorArticle.prevPage    = filter.requestUri + '&paging_type=1&page=' + (paginatorArticle.page - 1);
                        }
                    }
                    
                    if([0,2].includes(paging_type)){
                        paginatorBooking.page          = filter.search.page;
                        paginatorBooking.perPage       = filter.search.take;
                        paginatorBooking.currentPage   = filter.requestUri;
                        paginatorBooking.totalPage     = Math.ceil(paginatorBooking.totalItem / paginatorBooking.perPage);
                        if (paginatorBooking.totalPage > paginatorBooking.page) {
                            paginatorBooking.hasNextPage = true;
                            paginatorBooking.nextPage    = filter.requestUri + '&paging_type=2&page=' + (paginatorBooking.page + 1);
                        }
                        if (paginatorBooking.page >= 2) {
                            paginatorBooking.hasPrevPage = true;
                            paginatorBooking.prevPage    = filter.requestUri + '&paging_type=2&page=' + (paginatorBooking.page - 1);
                        }
                    }
                    res.render('home/index.ejs', { 
                        user: req.user,
                        errors: str_errors,
                        listArticle: listArticle,
                        listBooking: listBooking,
                        webService: webService,
                        moment: moment,
                        filter: filter,
                        paginatorBooking: paginatorBooking,
                        paginatorArticle: paginatorArticle
                    });
                }).catch(err => {
                    res.render("home/index.ejs", {
                        user: req.user,
                        errors: [err],
                        filter: filter,
                    });
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 0).then(function(dataFilter) {
            res.render("search/index.ejs", {
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
