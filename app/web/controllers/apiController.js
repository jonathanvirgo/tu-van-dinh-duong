var express         = require('express'),
    router          = express.Router(),
    moment          = require('moment'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    examineService  = require('./../models/examineModel');

router.get('/examine', function(req, res, next) {
    try {
        var str_errors = [],
            resultData = {
                detailExamine: []
            };
        console.log("req", req.query.p,);
        let phone = req.query.p ? req.query.p : '';
        let sql = ''
        examineService.getDetailExamineById("19").then(function(detailExamine) {
            if (detailExamine.success) {
                if(detailExamine.data.length == 0){
                    resultData.detailExamine = {}
                }else{
                    resultData.detailExamine = detailExamine.data[0];
                }
            }else{
                str_errors = str_errors.push(detailExamine.message);
            }
            return res.render("menu-example/index.ejs", {
                errors: str_errors,
                examine: resultData.detailExamine
            });
        });
    } catch (e) {
        
    }
});

module.exports = router;