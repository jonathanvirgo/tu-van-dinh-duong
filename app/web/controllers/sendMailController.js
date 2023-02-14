var express             = require("express");
var router              = express.Router();
var db                  = require('../../config/db');
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
            switch(type){
                case 'mail_Tao_Yeu_Cau_Duyet_Bai':
                case 'mail_Tao_YC_Dang_Bai':
                    param.link_noi_dung = req.body.link_noi_dung ? JSON.parse(req.body.link_noi_dung) : [];
                    param.giay_phep_qc = req.body.giay_phep_qc ? JSON.parse(req.body.giay_phep_qc) : [];
                    break;
                case 'mail_Huy_YC_DuyetBai':
                    param.cancel_type = req.body.cancel_type ? req.body.cancel_type : 'kh';
                    break;
                case 'mail_Tao_Book':
                    param.loop = req.body.loop;
                    break;
                case 'mail_gui_yeu_cau_huy':
                    param.ly_do = req.body.ly_do;
                    param.ma_yeu_cau_huy = req.body.ma_yeu_cau_huy;
                    break
                default: break;
            }
            // sendMailService.sendMailAll(book_id, type, param).then(success =>{
            //     res.json(success);
            // });
        }
    } catch (error) {
        res.json({
            success: false,
            message: error
        });
    }
});

module.exports = router;