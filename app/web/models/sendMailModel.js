var moment          = require('moment'),
    db              = require('./../../config/db'),
    mailService     = require('./../service/sendMail'),
    webService      = require('../models/webModel');

let sendMailService = {
    sendMailAll: function(book_id, type, param) {
        let title_mail = '';
        let paramMail;

        return new Promise((resolve, reject) => {
            let data = success[0];
            if (data) {
                let dinh_dang = data.post_type == 'default' ? 'Bài Thường' : (data.post_type == 'magazine' ? 'Bài Magazine' : 'Bài Webuy');
                switch (type) {
                    case 'mail_Tao_Book':
                        title_mail = 'Book ' + ' - ' + data.domain + ' - ' + data.channel_name + ' - ' + data.price + ' VNĐ - ' + moment(data.book_date).format('DD-MM-YYYY') + ' - ' + data.booking_id_pr;
                        paramMail = {
                            tieu_de_mail    : title_mail, 
                            site            : data.domain, 
                            chuyen_muc      : data.channel_name, 
                            loai_bai        : data.fm_name,
                            gia             : data.price, 
                            bookingId       : data.booking_id_pr, 
                            ngay            : moment(data.book_date).format('DD-MM-YYYY'), 
                            gio             : data.time_from, 
                            nguoi_nhan      : data.email, 
                            ten_khach_hang  : data.full_name ? data.full_name : data.username, 
                            link_chi_tiet   : param.link_domain + '/booking/detail/' + data.booking_id_pr
                        };
                        mailService.mail_Tao_Book(paramMail).then(success => {
                            if (success.success) {
                                sendMailService.updateTitleMail(title_mail, success.messageId, 'book', data.id);
                            }
                            resolve(success);
                            sendMailService.addLogMail(JSON.stringify(success), JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_Tao_Book');
                        })
                        break;
                }
            } else {
                resolve({
                    success: false,
                    message: 'Khong co du lieu!'
                });
            }
        });
    },
    testMail: function(type, paramMail){
        return new Promise((resolve, reject) => {
            switch (type) {
                case 'mail_Tao_Book':
                    mailService.mail_Tao_Book(paramMail).then(success => {
                        resolve(success);
                    })
                    break;
            }
        });
    }
}

module.exports = sendMailService;