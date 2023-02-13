var express             = require("express");
var router              = express.Router();
var db                  = require('../../config/db');
var sendMailService      = require('./../models/sendMailModel');
var webService          = require('./../models/webModel');

router.post('/send', function (req, res, next) {
    try {
        let resultData = {success: false, message: ''};
        if (!req.user) {
            resultData.message = "Vui lòng đăng nhập lại để thực hiện chức năng này!";
            res.json(resultData);
            return;
        }else{
            let book_id = req.body.book_id;
            let type    = req.body.type;
            let param   = {
                link_noi_dung       : [],
                giay_phep_qc        : [],
                link_anh_trang_chu  : '',
                link_anh_chuyen_muc : '',
                link_anh_bai        : '',
                cancel_type         : '',
                link_domain         : webService.fullUrl(req),
                loop                : '',
                ly_do               : '',
                ma_yeu_cau_huy      : ''
            };
            sendMailService.sendMailAll(book_id, type, param).then(success =>{
                res.json(success);
            });
        }
    } catch (error) {
        res.json({
            success: false,
            message: error
        });
    }
});

router.post('/test', (req, res, next) => {
    try {
        let resultData  = {
            success: false,
            data: ""
        };
        if(req.body.param &&  req.body.type){
            let param = JSON.parse(req.body.param);
            let type = req.body.type;
            sendMailService.testMail(type, param).then(success =>{
                res.json(success);
            });
        }else{  
            resultData.data = "Thieu param hoac type";
            res.json(resultData);
        }
    } catch (error) {
    }
});

module.exports = router;