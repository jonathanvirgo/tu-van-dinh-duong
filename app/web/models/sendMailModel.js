var moment          = require('moment'),
    db              = require('./../../config/db'),
    mailService     = require('./../service/sendMail'),
    webService      = require('../models/webModel');

let sendMailService = {
    sendMailAll: function(book_id, type, param) {
        let title_mail = '';
        let link_noi_dung       = param.link_noi_dung ? param.link_noi_dung : [];
        let giay_phep_qc        = param.giay_phep_qc ? param.giay_phep_qc : [];
        let link_anh_trang_chu  = param.link_anh_trang_chu ? param.link_anh_trang_chu : '';
        let link_anh_chuyen_muc = param.link_anh_chuyen_muc ? param.link_anh_chuyen_muc : '';
        let link_anh_bai        = param.link_anh_bai ? param.link_anh_bai : '';
        let chuyen_muc_duyet    = param.chuyen_muc_duyet ? param.chuyen_muc_duyet : '';
        let ly_do               = param.ly_do ? param.ly_do : '';
        let ma_yeu_cau_huy      = param.ma_yeu_cau_huy ? param.ma_yeu_cau_huy : '';
        let ma_yeu_cau_sua      = param.ma_yeu_cau_sua ? param.ma_yeu_cau_sua : '';
        let paramMail;

        return new Promise((resolve, reject) => {
            articleService.getAllDetailForSendMail(book_id).then(success => {
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
                        case 'mail_Huy_Book':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_book, 
                                bookingId       : data.booking_id_pr,
                                messageId       : data.mess_id_book,
                                link_chi_tiet   : param.link_domain + '/booking/create',
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username, 
                                nguoi_huy       : param.nguoi_huy,
                                ly_do           : param.ly_do
                            };
                            mailService.mail_Huy_Book(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success.success), JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_Huy_Book');
                            });
                            break;
                        case 'mail_Tao_Yeu_Cau_Duyet_Bai':
                            title_mail = 'BÀI ' + data.id_request + ' - ' + data.domain + ' - ' + ((data.channel_name && data.channel_name.length > 0) ? (data.channel_name + ' - ') : '') + data.price + ' VNĐ - ' + moment(data.art_created).format('DD-MM-YYYY');
                            paramMail = {
                                tieu_de_mail        : title_mail, 
                                site                : data.domain, 
                                chuyen_muc          : data.channel_name, 
                                loai_bai            : data.fm_name, 
                                gia                 : data.price, 
                                ma_bai              : data.id_request, 
                                nguoi_nhan          : data.email, 
                                tieu_de             : data.title_send_request, 
                                noi_dung_mo_ta      : data.description, 
                                link_noi_dung       : link_noi_dung, 
                                giay_phep_qc        : giay_phep_qc, 
                                link_chi_tiet       : param.link_domain + '/article/edit/' + data.id, 
                                ten_khach_hang      : data.full_name ? data.full_name : data.username
                            };
                            mailService.mail_Tao_Yeu_Cau_Duyet_Bai(paramMail).then(success => {
                                if (success.success) {
                                    sendMailService.updateTitleMail(title_mail, success.messageId, 'art', data.id); 
                                }
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success), JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_Tao_Yeu_Cau_Duyet_Bai');
                            })
                            break;
                        case 'mail_Huy_YC_DuyetBai':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_art, 
                                ma_bai          : data.id_request, 
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username,  
                                messageId       : data.mess_id_art, 
                                type            : param.cancel_type,
                                link_dung_bai   : param.link_domain + '/article/create'
                            }
                            mailService.mail_Huy_YC_DuyetBai(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success),JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_Huy_YC_DuyetBai');
                            });
                            break;
                        case 'mail_HUY_YC_Dang_Bai':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_art, 
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username, 
                                messageId       : data.mess_id_art, 
                                type            : param.cancel_type,
                                link_dung_bai   : param.link_domain + '/article/create'
                            }
                            mailService.mail_HUY_YC_Dang_Bai(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success),JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_HUY_YC_Dang_Bai');
                            });
                            break;
                        case 'mail_He_Thong_Duyet_Bai_Thanh_Cong':
                            paramMail = {
                                tieu_de_mail        : data.title_mail_art, 
                                site                : data.domain, 
                                ma_bai              : data.id_request, 
                                nguoi_nhan          : data.email, 
                                dinh_dang           : dinh_dang, 
                                chuyen_muc_duyet    : chuyen_muc_duyet, 
                                gia_duyet           : data.price_allow, 
                                link_noi_dung       : link_noi_dung, 
                                tieu_de             : data.title_send_request, 
                                ten_khach_hang      : data.full_name ? data.full_name : data.username, 
                                messageId           : data.mess_id_art, 
                                link_dung_bai       : param.link_domain + '/article/create'
                            };
                            mailService.mail_He_Thong_Duyet_Bai_Thanh_Cong(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success), JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_He_Thong_Duyet_Bai_Thanh_Cong');
                            });
                            break;
                        case 'mail_Chot_Duyet_File':
                            mailService.mail_Chot_Duyet_File(data.title_mail_art, data.domain, data.channel_name, data.id_request, data.price, moment(data.art_created).format('DD-MM-YYYY'), data.mess_id_art, (data.full_name ? data.full_name : data.username), data.email, link_noi_dung, data.title_send_request, data.id, 'https://pr-ims.admicro.vn/article/edit/' + data.id).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success), 'paramLogMail', success.success ? 1 : 0, 0, 'mail_Tao_Yeu_Cau_Duyet_Bai');
                            });
                            break;
                        case 'mail_Tao_YC_Dang_Bai':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_art, 
                                site            : data.domain, 
                                chuyen_muc      : data.channel_name, 
                                loai_bai        : data.fm_name, 
                                dinh_dang       : dinh_dang, 
                                gia             : data.price, 
                                messageId       : data.mess_id_art, 
                                bookingId       : data.booking_id_pr, 
                                ngay_len_site   : moment(data.book_date).format('DD-MM-YYYY'), 
                                gio_len_site    : data.time_from, 
                                tieu_de         : data.title_send_request, 
                                link_noi_dung   : link_noi_dung, 
                                link_chi_tiet   : param.link_domain + '/article/edit/' + data.id, 
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username
                            };
                            mailService.mail_Tao_YC_Dang_Bai(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success), JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_Tao_YC_Dang_Bai');
                            });
                            break;
                        case 'mail_He_Thong_Xac_Nhan_Du_DK_Dang':
                            paramMail = {
                                tieu_de_mail        : data.title_mail_art, 
                                site                : data.domain, 
                                dinh_dang           : dinh_dang, 
                                chuyen_muc_duyet    : chuyen_muc_duyet, 
                                gia_duyet           : data.price_allow, 
                                link_noi_dung       : link_noi_dung, 
                                tieu_de             : data.title_send_request, 
                                link_chi_tiet       : param.link_domain + '/article/edit/' + data.id, 
                                messageId           : data.mess_id_art,
                                nguoi_nhan          : data.email, 
                                ten_khach_hang      : data.full_name ? data.full_name : data.username
                            };
                            mailService.mail_He_Thong_Xac_Nhan_Du_DK_Dang(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success), JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_He_Thong_Xac_Nhan_Du_DK_Dang');
                            });
                            break;
                        // case 'mail_Anh_Nghiem_Thu':
                        //     mailService.mail_Anh_Nghiem_Thu(data.title_mail_art, data.domain, data.channel_name, data.id_request, moment(data.art_created).format('DD-MM-YYYY'), data.price, ata.mess_id_art, data.email, (data.full_name ? data.full_name : data.username), 'https://pr-ims.admicro.vn/article/edit/' + data.id, link_anh_trang_chu, link_anh_chuyen_muc, link_anh_bai).then(success => {
                        //         resolve(success);
                        //         sendMailService.addLogMail(JSON.stringify(success), 'paramLogMail', 1, 0, 'mail_Tao_Yeu_Cau_Duyet_Bai');
                        //     });
                        //     break;
                        case 'mail_KH_Duyet_LO':
                            paramMail = {
                                title_mail     : data.title_mail_art, 
                                booking_id     : book_id, 
                                message_id     : data.mess_id_art,
                                email          : data.email, 
                                full_name      : data.full_name ? data.full_name : data.username
                            };
                            mailService.mail_KH_Duyet_LO(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success), JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_KH_Duyet_LO');
                            });
                            break;
                        case 'mail_gui_yeu_cau_huy':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_art, 
                                ma_yeu_cau_huy  : ma_yeu_cau_huy, 
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username, 
                                messageId       : data.mess_id_art, 
                                ly_do           : ly_do,
                                link_chi_tiet   : param.link_domain + '/article/edit/' + data.id
                            }
                            mailService.mail_gui_yeu_cau_huy(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success),JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_gui_yeu_cau_huy');
                            });
                            break;
                        case 'mail_hoan_thanh_yeu_cau_huy':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_art, 
                                ma_yeu_cau_huy  : ma_yeu_cau_huy, 
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username, 
                                messageId       : data.mess_id_art, 
                                link_chi_tiet   : param.link_domain + '/article/edit/' + data.id,
                                accept          : param.accept ? param.accept : null
                            }
                            mailService.mail_hoan_thanh_yeu_cau_huy(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success),JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_hoan_thanh_yeu_cau_huy');
                            });
                            break;
                        case 'mail_gui_yeu_cau_sua':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_art, 
                                ma_yeu_cau_sua  : ma_yeu_cau_sua, 
                                ma_bai          : data.id_request,
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username, 
                                messageId       : data.mess_id_art, 
                                link_chi_tiet   : param.link_domain + '/article/edit/' + data.id,
                                link_chi_tiet_yeu_cau: param.link_domain + '/article/request-edit/'+ ma_yeu_cau_sua +'/' + data.id
                            }
                            mailService.mail_gui_yeu_cau_sua(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success),JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_gui_yeu_cau_sua');
                            });
                            break;
                        case 'mail_hoan_thanh_yeu_cau_sua':
                            paramMail = {
                                tieu_de_mail    : data.title_mail_art, 
                                ma_yeu_cau_sua  : ma_yeu_cau_sua, 
                                ma_bai          : data.id_request,
                                nguoi_nhan      : data.email, 
                                ten_khach_hang  : data.full_name ? data.full_name : data.username,  
                                messageId       : data.mess_id_art, 
                                accept          : param.accept ? param.accept : null,
                                link_chi_tiet   : param.link_domain + '/article/edit/' + data.id,
                                link_chi_tiet_yeu_cau: param.link_domain + '/article/request-edit/'+ ma_yeu_cau_sua +'/' + data.id
                            }
                            mailService.mail_hoan_thanh_yeu_cau_sua(paramMail).then(success => {
                                resolve(success);
                                sendMailService.addLogMail(JSON.stringify(success),JSON.stringify(paramMail), success.success ? 1 : 0, 0, 'mail_hoan_thanh_yeu_cau_sua');
                            });
                            break;
                        default:
                            break;
                    }
                } else {
                    resolve({
                        success: false,
                        message: 'Khong co du lieu!'
                    });
                }
            }).catch(err => {
                resolve({
                    success: false,
                    message: err,
                });
            });
        });
    },
    updateTitleMail: function(title_mail, mess_id, type, book_id) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                if (err) reject(err);
                let sql;
                if (type == 'book') {
                    sql = 'UPDATE pr_booking SET title_mail = ?, message_id = ? WHERE id = ?';
                } else {
                    sql = 'UPDATE pr_article SET title_mail = ?, message_id = ? WHERE booking_id = ?';
                }
                connection.query(sql, [title_mail, mess_id, book_id], function(error, results, fields) {
                    connection.release();
                    if (error) reject(error);
                    resolve(results);
                });
            });
        });
    },
    addLogMail: function(result, param, is_send, sent_tries, type) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                if (err) reject(err);
                let sql = 'INSERT INTO pr_log_mail(result, param, is_send, sent_tries, type) VALUES (?,?,?,?,?)';
                connection.query(sql, [result, param, is_send, sent_tries, type], function(error, results, fields) {
                    connection.release();
                    if (error) reject(error);
                    resolve(results);
                });
            });
        });
    },
    sendMailPostApi: async function(article, dataArticle, link_domain){
        switch(article.status){
            case 22:
                let chuyen_muc_duyet = await sendMailService.getChannelAllowString(dataArticle);
                let link_noi_dung = await sendMailService.getLinkContent(dataArticle);
                sendMailService.sendMailAll(dataArticle.booking_id, 'mail_He_Thong_Xac_Nhan_Du_DK_Dang', {chuyen_muc_duyet: chuyen_muc_duyet, link_noi_dung: link_noi_dung, link_domain: link_domain});
                break;
            case 14:
                sendMailService.sendMailAll(dataArticle.booking_id, 'mail_gui_yeu_cau_huy', {ly_do: article.reasonRequest, ma_yeu_cau_huy: article.idRequestCancel, link_domain: link_domain});
                break;
            case 16:
            case 17:
                sendMailService.sendMailAll(dataArticle.booking_id, 'mail_hoan_thanh_yeu_cau_sua', {ma_yeu_cau_sua: article.idRequestEdit, link_domain: link_domain, accept: ((article.status == 16) ? false : true)});
                break;
            default: break;
        }
        if(article.status_action){
            switch(article.status_action){
                case 211:
                    sendMailService.sendMailAll(dataArticle.booking_id, 'mail_HUY_YC_Dang_Bai', {cancel_type:'ht', link_domain: link_domain});
                    break;
                case 212:
                    sendMailService.sendMailAll(dataArticle.booking_id, 'mail_hoan_thanh_yeu_cau_huy', {accept: true, ma_yeu_cau_huy: dataArticle.total_request_cancel, link_domain: link_domain});
                    break;
                case 20:
                    sendMailService.sendMailAll(dataArticle.booking_id, 'mail_hoan_thanh_yeu_cau_huy', {accept: false, ma_yeu_cau_huy: dataArticle.total_request_cancel, link_domain: link_domain});
                    break;
                default: break;
            }
        }
        //-2: Nháp, -1: Đã hủy, 0: Giữ chỗ, 1: Chờ duyệt, 2: Đã duyệt, 
        //3: Bị trả lại, 4: Đã xuất bản, 5: Gửi duyệt, 6: Gửi đăng, 7: Chờ đăng
        switch(article.search_status){
            case 3:
                sendMailService.sendMailAll(dataArticle.booking_id, 'mail_Huy_YC_DuyetBai', {cancel_type:'ht', link_domain: link_domain});
                break;
            case 2:
                if(article.status_action && [211,212,20].includes(article.status_action)){
                    // switch(article.status_action){
                        // case 211:
                        //     sendMailService.sendMailAll(dataArticle.booking_id, 'mail_HUY_YC_Dang_Bai', {cancel_type:'ht', link_domain: link_domain});
                        //     break;
                        // case 212:
                        //     sendMailService.sendMailAll(dataArticle.booking_id, 'mail_hoan_thanh_yeu_cau_huy', {accept: true, ma_yeu_cau_huy: dataArticle.total_request_cancel, link_domain: link_domain});
                        //     break;
                    //     case 20:
                    //         sendMailService.sendMailAll(dataArticle.booking_id, 'mail_hoan_thanh_yeu_cau_huy', {accept: false, ma_yeu_cau_huy: dataArticle.total_request_cancel, link_domain: link_domain});
                    //         break;
                    //     default: break;
                    // }
                }else{
                    let chuyen_muc_duyet = await sendMailService.getChannelAllowString(dataArticle);
                    let link_noi_dung = await sendMailService.getLinkContent(dataArticle);
                    sendMailService.sendMailAll(dataArticle.booking_id, 'mail_He_Thong_Duyet_Bai_Thanh_Cong', {chuyen_muc_duyet: chuyen_muc_duyet, link_noi_dung: link_noi_dung, link_domain: link_domain});
                }
                break;
            default: break;
        }
    },
    getChannelAllowString: function(dataArticle){
        return new Promise((resolve, reject) => {
            let channels = [];
            let chuyen_muc_duyet = '';
            let channelAllowId = JSON.parse(dataArticle.list_channel_allow);
            channelService.searchAllChannel(dataArticle.site_id, function(err, result, fields) {
                if (err) {
                    
                }
                if (result !== undefined) {
                    channels = webService.sortChannelForTree(result, 0);
                    let listChannels = webService.sortChannelForVirtualSelect(channels);
                    chuyen_muc_duyet = channelService.getChannelAllowName(listChannels, channelAllowId);
                }
                resolve( chuyen_muc_duyet );
            });
        });
    },
    getLinkContent: function(dataArticle){
        return new Promise(async (resolve, reject) => {
            let link_noi_dung = [];
            if(dataArticle.type == 1){
                link_noi_dung = [dataArticle.url_demo];
            }else{
                dataFiles = await articleService.getDetailArticleFiles(dataArticle.booking_id);
                if(dataFiles.success && dataFiles.data.length > 0){
                    let files = articleService.changeArrFileArticle(dataFiles.data);
                    for(let file of files){
                        let detail = file.detail[file.detail.length - 1];
                        if (file.type == 2) {
                            link_noi_dung.push(detail.path_cloud);
                        }
                    }
                }
            }
            resolve(link_noi_dung);
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
                case 'mail_Huy_Book':
                    mailService.mail_Huy_Book(paramMail).then(success => {
                        resolve(success);
                    });
                    break;
                case 'mail_Tao_Yeu_Cau_Duyet_Bai':
                    mailService.mail_Tao_Yeu_Cau_Duyet_Bai(paramMail).then(success => {
                        resolve(success);
                    })
                    break;
                case 'mail_Huy_YC_DuyetBai':
                    mailService.mail_Huy_YC_DuyetBai(paramMail).then(success => {
                        resolve(success);
                    });
                    break;
                case 'mail_HUY_YC_Dang_Bai':
                    mailService.mail_HUY_YC_Dang_Bai(paramMail).then(success => {
                        resolve(success);
                    });
                    break;
                case 'mail_He_Thong_Duyet_Bai_Thanh_Cong':
                    mailService.mail_He_Thong_Duyet_Bai_Thanh_Cong(paramMail).then(success => {
                        resolve(success);
                    });
                    break;
                case 'mail_Chot_Duyet_File':
                    mailService.mail_Chot_Duyet_File(paramMail).then(success => {
                        resolve(success);
                    });
                    break;
                case 'mail_Tao_YC_Dang_Bai':
                    mailService.mail_Tao_YC_Dang_Bai(paramMail).then(success => {
                        resolve(success);
                    });
                    break;
                case 'mail_He_Thong_Xac_Nhan_Du_DK_Dang':
                    mailService.mail_He_Thong_Xac_Nhan_Du_DK_Dang(paramMail).then(success => {
                        resolve(success);
                    });
                    break;
                // case 'mail_Anh_Nghiem_Thu':
                //     mailService.mail_Anh_Nghiem_Thu(paramMail).then(success => {
                //         resolve(success);
                //     });
                //     break;
                default:
                    resolve({success: false, data:''});
                    break;
            }
        });
    }
}

module.exports = sendMailService;