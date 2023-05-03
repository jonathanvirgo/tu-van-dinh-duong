var express         = require('express'),
    router          = express.Router(),
    moment          = require('moment'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel');

router.get('/', function(req, res) {
    try {
        if (!req.user) {
            return res.redirect('/user/login');
        }
        webService.createSideBarFilter(req, 1).then(function(filter){
            var str_errors  = filter.error,
                arrPromise  = [],
                listExamine = [];

            return new Promise(function (resolve, reject) {
                Promise.all(arrPromise).then(function () {
                    res.render('weather/index.ejs', { 
                        user: req.user,
                        moment: moment,
                        filter: filter,
                        link:'weather'
                    });
                })
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 1).then(function(dataFilter) {
            res.render("weather/index.ejs", {
                user: req.user,
                filter: dataFilter,
                link:'weather'
            });
        })
    }
});

module.exports = router;