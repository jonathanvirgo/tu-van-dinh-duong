var express = require('express'),
    router = express.Router(),
    moment = require('moment'),
    logService = require('../../admin/models/logModel'),
    webService = require('./../models/webModel');

router.post('/', function (req, res) {
    try {
        let parameter = {
            cus_name: req.body.cus_name,
            cus_phone: req.body.cus_phone,
            cus_email: req.body.cus_email,
            cus_gender: req.body.cus_gender,
            cus_birthday: req.body.cus_birthday,
            cus_address: req.body.cus_address,
            diagnostic: req.body.diagnostic,
            cus_length: req.body.cus_length,
            cus_cntc: req.body.cus_cntc,
            cus_cnht: req.body.cus_cnht,
            cus_bmi: req.body.cus_bmi,
            clinical_examination: req.body.clinical_examination,
            erythrocytes: req.body.erythrocytes,
            cus_bc: req.body.cus_bc,
            cus_tc: req.body.cus_tc,
            cus_albumin: req.body.cus_albumin,
            cus_nakcl: req.body.cus_nakcl,
            cus_astaltggt: req.body.cus_astaltggt,
            cus_urecreatinin: req.body.cus_urecreatinin,
            cus_bilirubin: req.body.cus_bilirubin,
            exa_note: req.body.exa_note,
            cus_fat: req.body.cus_fat,
            cus_water: req.body.cus_water,
            cus_visceral_fat: req.body.cus_visceral_fat,
            cus_bone_weight: req.body.cus_bone_weight,
            cus_chcb: req.body.cus_chcb,
            cus_waist: req.body.cus_waist,
            cus_butt: req.body.cus_butt,
            cus_cseomong: req.body.cus_cseomong,
            active_mode_of_living: req.body.active_mode_of_living,
        };
        let sqlFindCustomer = 'SELECT id FROM customer WHERE cus_name = ? AND cus_gender = ? AND cus_birthday = ? AND cus_address = ?';
        webService.getListTable(sqlFindCustomer, [parameter.cus_name, parameter.cus_gender, parameter.cus_birthday, parameter.cus_address]).then(responseData2 => {
            console.log(responseData2);
            if (responseData2.data && responseData2.data.length == 0) {

            }
            res.json(responseData2);
        });
    } catch (e) {

    }
});

router.get('/excel', function (req, res, next) {
    try {
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }

        var str_errors = [],
            arrPromise = [],
            resultData = {
                filter: []
            };
        arrPromise.push(webService.createSideBarFilter(req, 1).then(function (dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));
        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                res.render("test/index.ejs", {
                    user: req.user,
                    errors: str_errors,
                    page: 'excel',
                    filter: resultData.filter,
                    link: 'test'
                });
            });
        });
    } catch (e) {
        webService.createSideBarFilter(req, 2).then(function (dataFilter) {
            res.render("test/index.ejs", {
                user: req.user,
                errors: str_errors,
                page: 'excel',
                filter: resultData.filter,
            });
        })
    }
});

router.get('/captcha', function (req, res, next) {
    var resultData = {
        success: false,
        message: "",
        data: ''
    };
    try {
        var str_errors = [],
            arrPromise = [],
            resultData = {
                filter: []
            };
        arrPromise.push(webService.createSideBarFilter(req, 1).then(function (dataFilter) {
            resultData.filter = dataFilter;
            if (resultData.filter.error.length > 0) {
                str_errors = str_errors.concat(resultData.filter.error);
            }
        }));
        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                res.render("test/index.ejs", {
                    user: req.user,
                    errors: str_errors,
                    page: 'captcha',
                    filter: resultData.filter,
                    link: 'test'
                });
            });
        });
    } catch (e) {
        console.log("e", e);
        webService.createSideBarFilter(req, 2).then(function (dataFilter) {
            res.render("test/index.ejs", {
                user: req.user,
                errors: str_errors,
                page: 'excel',
                filter: resultData.filter,
            });
        })
    }
});

router.post('/captcha', (res, req, next) => {
    try {
        if (req.body['g-recaptcha-response'] === undefined || req.body['g-recaptcha-response'] === '' || req.body['g-recaptcha-response'] === null) {
            return res.json({ "responseError": "something goes to wrong" });
        }

        const verificationURL = "https://www.google.com/recaptcha/api/siteverify?secret=" + '6LcO-x8mAAAAAPklWK1RXMSEA9_3DKS77hwTY7vV' + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;

        request(verificationURL, function (error, response, body) {
            webService.addRecordTable({"data":response},'log_info');
            body = JSON.parse(body);
            
            if (body.success !== undefined || !body.success) {
                return res.json({ "responseError": "Failed captcha verification" });
            }
            res.json({ "responseSuccess": "Sucess" });
        });
    } catch (error) {

    }
})

module.exports = router;