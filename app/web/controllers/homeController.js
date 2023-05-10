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
                datesRange   = getDatesRangeArray(filter.search.fromdate_statistic, filter.search.todate_statistic),
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

            arrPromise.push(new Promise(function (resolve, reject) {
                examineService.getAllArticleStatus(filter.search , function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(responseData){
                            if(responseData.message) str_errors.push(responseData.message);
                            else str_errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    if(result && result.length > 0){
                        for(let examine of result){
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

            arrPromise.push(new Promise(function(resolve, reject) {
                examineService.getExamineGroupByDate(filter.search, function (err, result, fields) {
                    if (err) {
                        return logService.create(req, err).then(function(){
                            str_errors.push(err.sqlMessage);
                            resolve();
                        });
                    }
                    var daylist = datesRange.reverse().map((v)=>v.toISOString().slice(0,10)).reverse();
                    if (result !== undefined && result.length > 0) {
                        for (var i = 0; i < daylist.length; i++) {
                            for (var j = 0; j < result.length; j++) {
                                if(!chartNews.datetime.includes(daylist[i])){
                                    var datetime = moment(result[j].reportdate).format("YYYY-MM-DD");
                                    if(datetime == daylist[i]){
                                        chartNews.label.push(moment(daylist[i]).format("DD-MM-YYYY"));
                                        chartNews.datetime.push(daylist[i]);
                                        chartNews.news.push(result[j].total);
                                    }
                                }
                            }
                            if(!chartNews.datetime.includes(daylist[i])){
                                chartNews.label.push(moment(daylist[i]).format("DD-MM-YYYY"));
                                chartNews.datetime.push(daylist[i]);
                                chartNews.news.push(0);
                            }
                        }
                        chartNews.max_news = Math.max.apply(null, chartNews.news);
                    }
                    resolve();
                });
            }));
            
            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    if(chartNews.label.length > 60){
                        //2 tháng < time range < 6 tháng ---> hiển thị weekly
                        if(chartNews.label.length < 180){
                            chartNews = generateRangeArray(chartNews, filter.search.fromdate, filter.search.todate, 7);
                        } else {
                            //nếu > 6 tháng ---> hiển thị monthly
                            chartNews = generateRangeArray(chartNews, filter.search.fromdate, filter.search.todate, 30);
                        }
                    }
                    
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
                        link:'dashboard',
                        moment: moment,
                    });
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 0).then(function(dataFilter) {
            res.render("home/index.ejs", {
                user: req.user,
                errors: [e.message],
                filter: dataFilter,
                link:'dashboard',
                moment: moment,
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

function generateRangeArray(chartNews, startDate, endDate, numberDay){
    let arr       = [];
    let from      = new Date(startDate.split("-").reverse().join("-")).getTime();
    let to        = new Date(endDate.split("-").reverse().join("-")).getTime();
    let day       = 86400000;
    let week      = day * numberDay;
    let current   = 0;
    let weeks     = (to-from)/day/numberDay;
    let chartData = {
        datetime:[],
        label: [],
        news: [],
        pageview: [],
        max_news: 0,
        max_pageview: 0
    };
    
    for (i = 0; i < weeks; i++){
      arr.push(moment(new Date(from += week)).format("YYYY-MM-DD"));
    }

    for (var j = 0; j < arr.length; j++) {
        let prev_datetime = new Date(new Date(arr[j]).getTime() - week),
            label_name    = moment(prev_datetime).format("DD-MM-YYYY") + '<br/>' + moment(arr[j]).format("DD-MM-YYYY");
     
        chartData.news[j]     = 0;
        chartData.pageview[j] = 0;
        for (var i = 0; i < chartNews.label.length; i++) {
            if((new Date(chartNews.datetime[i]) < new Date(arr[j])) && (new Date(chartNews.datetime[i]) > prev_datetime)){
                chartData.news[j]      += chartNews.news[i];
                chartData.pageview[j]  += chartNews.pageview[i];
            }
        }
        chartData.label.push(label_name);
        chartData.datetime.push(arr[j]);
    }
    chartData.max_news     = Math.max(...chartData.news);
    chartData.max_pageview = Math.max(...chartData.pageview);
    return chartData;
}
module.exports = router;
