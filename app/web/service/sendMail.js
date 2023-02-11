var nodemailer     = require('nodemailer'),
    def            = require('../../config/default'),
    webService     = require('../models/webModel');

// nếu chưa có booking thì set mặc định bookingId = 0
// ma_bai  mã được tạo khi dựng bài
// site tên chính xác của site vd : kenh14.vn .....
// link_chi_tiet là link dẫn đến form tạo yêu cầu đăng hoặc chi tiết bài viết...
// noi_dung_mo_ta là nội dung được nhập từ form
// link_noi_dung là list link nội dung bài viết
// nguoi_nhan : email của khách hàng
// giay_phep_qc : list giấy phép quảng các
var timeout = 5000;

let mailService = {
    // mail_signup: function (email, activeaccount) {
    //     return new Promise(function (resolve, reject) {
    //         var transporter     = def.mail_header;
    //         var content_message = `
    //             <p>Bạn nhận được thông báo này vì bạn (hoặc người khác) đã yêu cầu tạo tài khoản từ email của bạn.</p>
    //             <p>Vui lòng nhấp vào liên kết sau hoặc dán liên kết này vào trình duyệt của bạn để hoàn tất quy trình kích hoạt tài khoản</p>
    //         `;
    //         var content     = webService.templateEmail(content_message + activeaccount);
    //         var mailOptions = {
    //             from: 'Pr-ims Admicro <no-reply@admicro.vn>',
    //             to: email,
    //             subject: "Pr-ims - Kích hoạt tài khoản",
    //             html: content
    //         }
    //         transporter.sendMail(mailOptions, (error, data) => {
    //             if (error) {
    //                 resolve({
    //                     success: false,
    //                     message: error
    //                 });
    //             } else {
    //                 resolve({
    //                     success: true,
    //                     messageId: data.messageId,
    //                     message: "Successful"
    //                 });
    //             }
    //         });
    //     })
    // },
    mail_Tao_Book: function (param) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter  = def.mail_header;
                var subject      = param.tieu_de_mail;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: ` + param.ten_khach_hang + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo: Khách hàng đã <b>tạo booking mã `+ param.bookingId + ` thành công</b> trên website ` + param.site + `</div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Thông tin chi tiết như sau:</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 40px;word-break:break-word; padding-bottom:16px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:24px;text-align:left;color:#333333;">
                                <ul>
                                    <li style="padding-bottom: 8px">Chuyên mục:  `+ param.chuyen_muc +` </li>
                                    <li style="padding-bottom: 8px">Loại bài: `+ param.loai_bai +`   </li>
                                    <li style="padding-bottom: 8px">Giá trị đăng bài: `+ param.gia +` VNĐ  </li>
                                    <li style="padding-bottom: 8px">Thời gian lên site: <strong>  `+ param.ngay + ' ' + param.gio +`</strong></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `;
                let button = `
                    <a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;">Xem chi tiết booking</a>
                `;
                var content     = webService.templateEmailNew(content_message, button);

                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    subject: subject,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                        setTimeout(() => {
                            mailService.mail_Tao_Book(param);
                        }, timeout);
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_Tao_Book');
            }
        })
    },
    mail_Huy_Book: function (param) {
        return new Promise(function (resolve, reject) {    
            try {
                var transporter     = def.mail_header;
                var subject         = param.tieu_de_mail;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: ` + param.ten_khach_hang + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo:  <b>hủy booking ` + param.bookingId + `</b> thành công</div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Lý do hủy: <b> ` + param.ly_do + `</b></div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Người hủy: <b> ` + param.nguoi_huy + `</b></div>
                        </td>
                    </tr>
                `;
                let button = `
                    <a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;">Tạo booking mới</a>
                `;
                var content     = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    inReplyTo: param.messageId,
                    subject: subject,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_Huy_Book');
            }    
        })
    },
    mail_Xuat_Ban_Book: function (tieu_de_mail, link_xuat_ban, messageId, nguoi_nhan, ten_khach_hang, link_chi_tiet) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter = def.mail_header;
                var subject = tieu_de_mail;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: ` + ten_khach_hang + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo: Khách hàng đã <b>tạo booking mã ` + bookingId + ` thành công</b> trên website ` + site + `</div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Link bài :<a  href="` + link_xuat_ban + `" style="color: #273F90;font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19px;text-align:left;"> ` + link_xuat_ban + `</a></div>
                        </td>
                    </tr>
                `;
                let button = `
                    <a href="`+ link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;">Xem chi tiết booking</a>
                `;
                var content     = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: nguoi_nhan,
                    subject: subject,
                    html: content,
                    inReplyTo: messageId
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_Xuat_Ban_Book');
            }
        })
    },
    mail_Tao_Yeu_Cau_Duyet_Bai: function (param) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter = def.mail_header;
                var subject = param.tieu_de_mail
                var str_link_noi_dung = '';
                for (var i = 0; i < param.link_noi_dung.length; i++) {
                    str_link_noi_dung = str_link_noi_dung + '<a  href="' + param.link_noi_dung[i] + '" style="color: #5e6ebf;font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19px;text-align:left;"> ' + param.link_noi_dung[i] + '</a><br>';
                }
                var str_giay_phep_qc = '';
                if (param.giay_phep_qc.length > 0) {
                    for (i = 0; i < param.giay_phep_qc.length; i++) {
                        str_giay_phep_qc = str_giay_phep_qc + '<a  href="' + param.giay_phep_qc[i] + '" style="color: #5e6ebf;font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19px;text-align:left;"> ' + param.giay_phep_qc[i] + '</a><br>';
                    }
                }
                var str_chuyen_muc = "";
                if (param.chuyen_muc && param.chuyen_muc.length > 1) {
                    str_chuyen_muc = '<li style="padding-bottom: 8px"> Chuyên mục:<strong> '+ param.chuyen_muc + '</strong>  </li>';
                }

                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: ` + param.ten_khach_hang + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo: Khách hàng đã <b>gửi yêu cầu duyệt bài mã `+ param.ma_bai +` thành công</b>  trên hệ thống website `+ param.site +`</div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Thông tin chi tiết như sau:</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 40px;word-break:break-word; padding-bottom:16px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:24px;text-align:left;color:#333333;">
                            <ul>
                            <li style="padding-bottom: 8px">Chuyên mục:  `+ str_chuyen_muc +` </li>
                            <li style="padding-bottom: 8px">Loại bài: `+ param.loai_bai +`   </li>
                            <li style="padding-bottom: 8px">Giá trị đăng bài: `+ param.gia +` VNĐ  </li>
                            <li style="padding-bottom: 8px"> Nội dung yêu cầu:<br> <strong style="font-weight: 600;">  `+ param.noi_dung_mo_ta +`</strong> </li>
                            <li style="padding-bottom: 8px">Nội dung bài viết:  <br> `+ str_link_noi_dung +`</li>
                            <li style="padding-bottom: 8px">Tiêu đề bài viết: 
                                <span style="font-weight:600;">` + param.tieu_de + `</span>   
                            </li>
                            <li style="padding-bottom: 8px">Giấy phép quảng cáo: <br> 
                                `+ str_giay_phep_qc +`
                            </li>
                            </ul>
                        </div>
                        </td>
                    </tr>
                `;
                let button = `
                    <a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài và trao đổi </a>
                `;
                var content     = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    subject: subject,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                        setTimeout(() => {
                            mailService.mail_Tao_Yeu_Cau_Duyet_Bai(param);
                        }, timeout);
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_Tao_Yeu_Cau_Duyet_Bai');
            }
            
        })
    },
    mail_Huy_YC_DuyetBai: function (param) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter = def.mail_header;
                var subject = param.tieu_de_mail;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">
                            Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                `;
                if(param.type == 'kh'){
                    content_message += `
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                                <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo: Bạn đã <strong>
                                hủy bài mã `+ param.ma_bai +` thành công
                                </strong> </div>
                            </td>
                        </tr> 
                    `;
                }else if(param.type == 'ht'){
                    content_message += `
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">
                            Media oder trân trọng thông báo: <b> bài ` + param.ma_bai + ` không đủ điều kiện được duyệt.</b>
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333; padding-top: 8px; ">
                            Vui lòng làm việc với vận hành để được hỗ trợ chi tiết.</div>
                        </td>
                    </tr>`;
                }
                let button = `
                    <a href="`+ param.link_dung_bai +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Tạo bài viết mới </a>
                `;
                let content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    inReplyTo: param.messageId,
                    subject: subject,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                        setTimeout(() => {
                            mailService.mail_Huy_YC_DuyetBai(param);
                        }, timeout);
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_Huy_YC_DuyetBai');
            }
        })

    },
    mail_He_Thong_Duyet_Bai_Thanh_Cong: function (param) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter = def.mail_header;
                var subject = param.tieu_de_mail;
                var str_link_noi_dung = '';
                for (var i = 0; i < param.link_noi_dung.length; i++) {
                    str_link_noi_dung = str_link_noi_dung + '<a style=" text-decoration: none; "  href="' + param.link_noi_dung[i] + '"> ' + param.link_noi_dung[i] + '</a><br>'
                }
    
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo: <b> Duyệt bài mã `+ param.ma_bai +` thành công</b></div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Thông tin chốt duyệt</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 40px;word-break:break-word; padding-bottom:16px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:24px;text-align:left;color:#333333;">
                            <ul>
                            <li style="padding-bottom: 8px">Website:  <strong>`+ param.site +`</strong> </li>
                            <li style="padding-bottom: 8px">Định dạng: <strong>`+ param.dinh_dang +`</strong>   </li>
                            <li style="padding-bottom: 8px">Chuyên mục được duyệt: <strong>`+ param.chuyen_muc_duyet +`</strong>  </li>
                            <li style="padding-bottom: 8px"> Giá trị được duyệt:  <strong style="font-weight: 600;"> `+ param.gia_duyet +` VNĐ
                            </strong> </li>
                            <li style="padding-bottom: 8px">Nội dung bài viết: <br>` + str_link_noi_dung + `</li>
                            <li style="padding-bottom: 8px">Tiêu đề bài viết <span style="font-weight:600;">`+ param.tieu_de +`</span> </li>
                            </ul>
                        </div>
                        </td>
                    </tr>
                `;
                let button = `
                    <a href="`+ param.link_dung_bai +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Tạo bài viết mới </a>
                `;
    
                var content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    inReplyTo: param.messageId,
                    subject: subject,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                        setTimeout(() => {
                            mailService.mail_He_Thong_Duyet_Bai_Thanh_Cong(param);
                        }, timeout);
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_He_Thong_Duyet_Bai_Thanh_Cong');
            }
        });
    },
    mail_Tao_YC_Dang_Bai: function (param) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter = def.mail_header;
                var subject = param.tieu_de_mail;
                var str_link_noi_dung = '';
                for (var i = 0; i < param.link_noi_dung.length; i++) {
                    str_link_noi_dung = str_link_noi_dung + '<a style=" text-decoration: none; "  href="' + param.link_noi_dung[i] + '"> ' + param.link_noi_dung[i] + '</a><br>'
                }
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: ` + param.ten_khach_hang + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo:Khách hàng đã <b> tạo yêu cầu đăng bài thành công </b> trên site ` + param.site + ` với booking ` + param.bookingId + `.</div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Thông tin chi tiết như sau:</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 40px;word-break:break-word; padding-bottom:16px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:24px;text-align:left;color:#333333;">
                            <ul>
                            <li style="padding-bottom: 8px">Chuyên mục:  `+ param.chuyen_muc +` </li>
                            <li style="padding-bottom: 8px">Loại bài: `+ param.loai_bai +`   </li>
                            <li style="padding-bottom: 8px">Giá trị đăng bài: `+ param.gia +` VNĐ  </li>
                            <li style="padding-bottom: 8px"> Định dạng: <strong style="font-weight: 600;"> `+ param.dinh_dang +`
                            </strong> </li>
                            <li style="padding-bottom: 8px"> Ngày giờ đăng: <strong style="font-weight: 600;"> `+ param.ngay_len_site +` `+ param.gio_len_site +`
                            </strong> </li>
                            <li style="padding-bottom: 8px">Nội dung bài viết:  <br>
                                `+ str_link_noi_dung +`
                            </li>
                            <li style="padding-bottom: 8px">Tiêu đề bài viết<span style="font-weight:600;">
                                `+ param.tieu_de +`
                            </span>
                            </li>
                            </ul>
                        </div>
                        </td>
                    </tr>
                `;
                let button = `
                    <a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Tạo bài viết mới </a>
                `;

                var content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    subject: subject,
                    inReplyTo: param.messageId,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                        setTimeout(() => {
                            mailService.mail_Tao_YC_Dang_Bai(param);
                        }, timeout);
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_Tao_YC_Dang_Bai');
            }
        })
    },
    mail_HUY_YC_Dang_Bai: function (param) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter = def.mail_header;
                var subject = param.tieu_de_mail;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                `;
                if(param.type == 'kh'){
                    content_message = `
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo bạn đã  <strong>
                                hủy yêu cầu đăng bài thành công.
                            </strong> </div>
                            </td>
                        </tr> 
                    `;
                }else if(param.type == 'ht'){
                    content_message = `
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng  <strong>
                                thông báo yêu cầu đăng bài đã bị hủy.
                            </strong> </div>
                            </td>
                        </tr> 
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                                <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333; padding-top:8px">Vui lòng làm việc với vận hành để được hỗ trợ chi tiết.</div>
                            </td>
                        </tr> 
                    `;
                }
                let button = `
                    <a href="` + param.link_dung_bai +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Tạo bài viết mới </a>
                `;
                var content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    inReplyTo: param.messageId,
                    subject: subject,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                        setTimeout(() => {
                            mailService.mail_HUY_YC_Dang_Bai(param);
                        }, timeout);
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_HUY_YC_Dang_Bai');
            }
        })
    },
    mail_He_Thong_Xac_Nhan_Du_DK_Dang: function (param) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter = def.mail_header;
                var subject = param.tieu_de_mail
                var str_link_noi_dung = '';
                for (var i = 0; i < param.link_noi_dung.length; i++) {
                    str_link_noi_dung = str_link_noi_dung + '<a  href="' + param.link_noi_dung[i] + '" style="color: #5e6ebf;font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19px;text-align:left;"> ' + param.link_noi_dung[i] + '</a><br>';
                }
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;"> Media oder thông báo <strong>xác nhận yêu cầu đăng bài </strong>  của quý khách. </div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Thông tin xác nhận:</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:10px 40px;word-break:break-word; padding-bottom:16px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:24px;text-align:left;color:#333333;">
                                <ul>
                                    <li style="padding-bottom: 8px">Website:  <strong>`+ param.site +`</strong> </li>
                                    <li style="padding-bottom: 8px">Định dạng: <strong> ` + param.dinh_dang + `</strong>  </li>
                                    <li style="padding-bottom: 8px">Chuyên mục được duyệt: <strong> `+ param.chuyen_muc_duyet +`</strong> </li>
                                    <li style="padding-bottom: 8px"> Giá trị được duyệt:  <strong style="font-weight: 600;"> `+ param.gia_duyet +` VNĐ</strong> </li>
                                    <li style="padding-bottom: 8px">Nội dung bài viết:  <br>` + str_link_noi_dung + `</li>
                                    <li style="padding-bottom: 8px">Tiêu đề bài viết :<span style="font-weight:600;">`+ param.tieu_de +`</span></li>
                                </ul>
                            </div>
                        </td>
                    </tr>
                `;

                let button = `<a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài và trao đổi </a>`;

                var content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    inReplyTo: param.messageId,
                    subject: subject,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                        setTimeout(() => {
                            mailService.mail_He_Thong_Xac_Nhan_Du_DK_Dang(param);
                        }, timeout);
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_He_Thong_Xac_Nhan_Du_DK_Dang');
            }
        })
    },
    mail_Yeu_Cau_KH_Duyet_LO: function (article) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter  = def.mail_header;
                var article_link = webService.getDomainPRIMS() + '/article/edit/' + article.booking_id;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: ` + article.full_name + `</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo: bài mã ` + article.id_request + ` của quý khách đã được <b> dựng layout.</b></div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Link layout : <a  href="`+ article.url_demo + `" style="color: #5e6ebf;font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19px;text-align:left;">`+ article.url_demo +`</a></div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;"><b>Vui lòng duyệt layout để tiếp tục quá trình đăng. </b></div>
                        </td>
                    </tr>
                `;
                let button = `
                    <a href="`+ article_link +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;">Duyệt layout</a>
                `;
                var content     = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: article.email + ",quannguyenhai@admicro.vn",
                    subject: article.title_mail,
                    inReplyTo: article.message_id,
                    html: content
                };
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_Yeu_Cau_KH_Duyet_LO');
            }
        })
    },
    mail_KH_Duyet_LO: function (article) {
        return new Promise(function (resolve, reject) {
            try {
                var transporter  = def.mail_header;
                var article_link = webService.getDomainPRIMS() + '/article/edit/' + article.booking_id;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ article.full_name +`</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;"> Media oder trân trọng thông báo: Khách hàng <b>đã duyệt layout và tiếp tục xử lý đăng.</b></div>
                        </td>
                    </tr>
                `;

                let button = `<a href="`+ article_link +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài và trao đổi </a>`;

                var content = webService.templateEmailNew(content_message, button);

                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: article.email + ",quannguyenhai@admicro.vn",
                    subject: article.title_mail,
                    inReplyTo: article.message_id,
                    html: content
                };
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_KH_Duyet_LO');
            }
        })
    },
    mail_KH_Khong_Duyet_LO: function (article, ly_do = "") {
        return new Promise(function (resolve, reject) {
            try {
                var transporter  = def.mail_header;
                var article_link = webService.getDomainPRIMS() + '/article/edit/' + article.booking_id;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ article.full_name +`</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;"> Media oder trân trọng thông báo: Khách hàng <b>đã từ chối duyệt layout.</b></div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;"> Lý do từ chối: `+ ly_do +`</div>
                        </td>
                    </tr>
                `;

                let button = `<a href="`+ article_link +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài và trao đổi </a>`;

                var content = webService.templateEmailNew(content_message, button);
            
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: article.email,
                    subject: article.title_mail,
                    inReplyTo: article.message_id,
                    html: content
                };
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_KH_Khong_Duyet_LO');
            }
        })
    },
    // mail_Anh_Nghiem_Thu: function (tieu_de_mail, messageId, nguoi_nhan, ten_khach_hang, link_chi_tiet, link_anh_trang_chu, link_anh_chuyen_muc, link_anh_bai) {
    //     return new Promise(function (resolve, reject) {
    //         var transporter = def.mail_header;
    //         var subject = tieu_de_mail;
    //         var content = '<!doctype html><html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">' +
    //             '<head>' +
    //             '  <title>' +
    //             '  </title>' +
    //             '  <meta http-equiv="X-UA-Compatible" content="IE=edge">' +
    //             '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">' +
    //             '  <meta name="viewport" content="width=device-width, initial-scale=1">' +
    //             '  <style type="text/css">' +
    //             '    @import url("https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;0,1000;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900;1,1000&display=swap");' +
    //             '    #outlook a {' +
    //             '      padding: 0;' +
    //             '    }' +
    //             '    body {' +
    //             '      margin: 0;' +
    //             '      padding: 0;' +
    //             '      -webkit-text-size-adjust: 100%;' +
    //             '      -ms-text-size-adjust: 100%;' +
    //             '      font-family: "Nunito", sans-serif;' +
    //             '    }' +
    //             '    table,' +
    //             '    td {' +
    //             '      border-collapse: collapse;' +
    //             '      mso-table-lspace: 0pt;' +
    //             '      mso-table-rspace: 0pt;' +
    //             '    }' +
    //             '    img {' +
    //             '      border: 0;' +
    //             '      height: auto;' +
    //             '      line-height: 100%;' +
    //             '      outline: none;' +
    //             '      text-decoration: none;' +
    //             '      -ms-interpolation-mode: bicubic;' +
    //             '    }' +
    //             '    p {' +
    //             '      display: block;' +
    //             '      margin: 0;' +
    //             '    }' +
    //             '    ul{' +
    //             '      margin: 0;' +
    //             '      padding-left: 28px;' +
    //             '    }' +
    //             '    ul li::marker {' +
    //             '      color: #BDBDBD !important;' +
    //             '      font-size: 1em;' +
    //             '    }' +
    //             '  </style>' +
    //             '  <style type="text/css">' +
    //             '    @media only screen and (min-width:480px) {' +
    //             '      .mj-column-per-100 {' +
    //             '        width: 100% !important;' +
    //             '        max-width: 100%;' +
    //             '      }' +
    //             '      .mj-column-per-50 {' +
    //             '        width: 50% !important;' +
    //             '        max-width: 50%;' +
    //             '      }' +
    //             '    }' +
    //             '  </style>' +
    //             '  <style media="screen and (min-width:480px)">' +
    //             '    .moz-text-html .mj-column-per-100 {' +
    //             '      width: 100% !important;' +
    //             '      max-width: 100%;' +
    //             '    }' +
    //             '    .moz-text-html .mj-column-per-50 {' +
    //             '      width: 50% !important;' +
    //             '      max-width: 50%;' +
    //             '    }' +
    //             '  </style>' +
    //             '  <style type="text/css">' +
    //             '    @media only screen and (max-width:480px) {' +
    //             '      table.mj-full-width-mobile {' +
    //             '        width: 100% !important;' +
    //             '      }' +
    //             '      td.mj-full-width-mobile {' +
    //             '        width: auto !important;' +
    //             '      }' +
    //             '      .mj-mg5{' +
    //             '        margin-top: 30px;' +
    //             '      }' +
    //             '      .mj-fs13{' +
    //             '        font-size: 13px !important;' +
    //             '      }' +
    //             '    }' +
    //             '  </style>' +
    //             '</head>' +
    //             '<body style="word-spacing:normal;background-color:#F4F4F4; margin-top: 20px ">' +
    //             '  <div style="background-color:#F4F4F4;">' +
    //             '    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:700px;">' +
    //             '      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">' +
    //             '        <tbody>' +
    //             '          <tr>' +
    //             '            <td style="border-bottom:1px solid rgba(224, 224, 224, 1);direction:ltr;font-size:0px;text-align:center;">' +
    //             '              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">' +
    //             '                  <tbody>' +
    //             '                    <tr>' +
    //             '                      <td align="center" style="font-size:0px;padding:24px 0px 13px 0; word-break:break-word;">' +
    //             '                        <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;border-spacing:0px;">' +
    //             '                          <tbody>' +
    //             '                            <tr>' +
    //             '                              <td style="">' +
    //             '                                <img height="auto" src="https://adi.admicro.vn/adt/tvc/files/images/1122/admicro_1668484430.png" style="border:0;display:block;outline:none;text-decoration:none;height:auto;max-width:100%;font-size:13px;" title=""/>' +
    //             '                              </td>' +
    //             '                            </tr>' +
    //             '                          </tbody>' +
    //             '                        </table>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                  </tbody>' +
    //             '                </table>' +
    //             '              </div>' +
    //             '            </td>' +
    //             '          </tr>' +
    //             '        </tbody>' +
    //             '      </table>' +
    //             '    </div>' +
    //             '      <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:700px; padding-top: 20px;">' +
    //             '                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">' +
    //             '                  <tbody>' +
    //             '                    <tr>' +
    //             '                      <td style="direction:ltr;font-size:0px;text-align:center;">' +
    //             '                        <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '                          <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">' +
    //             '                            <tbody>' +
    //             '                              <tr>' +
    //             '                                <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">' +
    //             '                                  <div style="font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: ' + ten_khach_hang + '</div>' +
    //             '                                </td>' +
    //             '                              </tr>' +
    //             '                              <tr>' +
    //             '                                <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">' +
    //             '                                  <div style="font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo:<b> chụp ảnh nghiệm thu thành công</b></div>' +
    //             '                                </td>' +
    //             '                              </tr> ' +
    //             '                              <tr>' +
    //             '                                <td align="left" style="font-size:0px;padding:10px 40px;word-break:break-word;">' +
    //             '                                  <div style="font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:24px;text-align:left;color:#333333;">' +
    //             '                                    <ul>' +
    //             '                                      <li style="padding-bottom: 8px">Ảnh trang chủ:<strong> ' + link_anh_trang_chu + '</strong> </li>' +
    //             '                                      <li style="padding-bottom: 8px">Ảnh chuyên mục:<strong> ' + link_anh_chuyen_muc + '</strong>  </li>' +
    //             '                                      <li style="padding-bottom: 8px">Ảnh nội dung:<strong> ' + link_anh_bai + '</strong> </li>' +
    //             '                                    </ul>' +
    //             '                                  </div>' +
    //             '                                </td>' +
    //             '                              </tr>' +
    //             '                        </div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                  </tbody>' +
    //             '                </table>' +
    //             '              </div>' +
    //             '    <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:700px;">' +
    //             '      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">' +
    //             '        <tbody>' +
    //             '          <tr>' +
    //             '            <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">' +
    //             '              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">' +
    //             '                  <tbody>' +
    //             '                    <tr>' +
    //             '                      <td align="center" style="font-size:0px;padding:10px 25px;padding-bottom:34px;word-break:break-word;">' +
    //             '                        <div style="font-family:\'Nunito\', Helvetica, Arial, sans-serif;font-size:13px;line-height:1;text-align:center;color:#000000;">' +
    //             '<a href="' + link_chi_tiet + '" style="text-decoration:none; color:#fff; background-color:#4E77FF; padding:11px 16px; border-radius:3px; font-family:\'Nunito\',Helvetica,Arial,sans-serif;"> Xem chi tiết bài và trao đổi </a></div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                  </tbody>' +
    //             '                </table>' +
    //             '              </div>' +
    //             '            </td>' +
    //             '          </tr>' +
    //             '        </tbody>' +
    //             '      </table>' +
    //             '    </div>' +
    //             '    <div style="background:#24346A;background-color:#24346A;margin:0px auto;max-width:700px;">' +
    //             '      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#24346A;background-color:#24346A;width:100%;">' +
    //             '        <tbody>' +
    //             '          <tr>' +
    //             '            <td style="direction:ltr;font-size:0px;padding:24px 40px 0 40px;text-align:center;">' +
    //             '              <div class="mj-column-per-50 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">' +
    //             '                  <tbody>' +
    //             '                    <tr>' +
    //             '                      <td align="left" style="font-size:0px;word-break:break-word;">' +
    //             '                        <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#55575d; margin-bottom: 17px;">' +
    //             '                          <p style="line-height: 19px; text-align: left; font-size:14px;color:#fcfcfc;font-family:\'Nunito\',Helvetica,Arial,sans-serif; display: flex;">' +
    //             '                            <img src="https://adi.admicro.vn/adt/tvc/files/images/1122/phone_1668496873.png" alt="" style="padding-right: 8px;">' +
    //             '                            <b>Tư vấn hỗ trợ</b></p>' +
    //             '                        </div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                    <tr>' +
    //             '                      <td align="left" style="font-size:0px;word-break:break-word;">' +
    //             '                        <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#55575d;">' +
    //             '                          <p style="line-height: 16px; text-align: left; color:#f5f5f5;font-size:14px;font-family:\'Nunito\',Helvetica,Arial,sans-serif;margin-bottom: 4px;">Email: <a style="color: #60BFD4;" href="mailto:contact@admicro.vn" target="_blank">contact@admicro.vn</a></p>' +
    //             '                          <p style="line-height: 16px; text-align: left; color:#f5f5f5;font-size:14px;font-family:\'Nunito\',Helvetica,Arial,sans-serif">Hotline: <b style="color:rgba(91, 205, 143, 1);font-size: 16.37px; line-height: 21.82px;">(024) 7307 7979</b> </p>' +
    //             '                          <p style="line-height: 16px; text-align: left; color:#f5f5f5;font-size:14px;font-family:\'Nunito\',Helvetica,Arial,sans-serif">Fax: <b style="color:rgba(91, 205, 143, 1);font-size: 16.37px; line-height: 21.82px;">(024) 7307 7980</b> </p>' +
    //             '                        </div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                  </tbody>' +
    //             '                </table>' +
    //             '              </div>' +
    //             '              <div class="mj-column-per-50 mj-outlook-group-fix mj-mg5" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">' +
    //             '                  <tbody>' +
    //             '                    <tr>' +
    //             '                      <td align="left" style="font-size:0px;word-break:break-word;">' +
    //             '                        <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#55575d; margin-bottom: 17px;">' +
    //             '                          <p style="line-height: 19px; text-align: left; font-size:14px;color:#fcfcfc;font-family:\'Nunito\',Helvetica,Arial,sans-serif; display:flex;"><img src="https://adi.admicro.vn/adt/tvc/files/images/1122/location_1668498012.png" alt="" style="padding-right: 8px;"><b>Địa chỉ</b></p>' +
    //             '                        </div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                    <tr>' +
    //             '                      <td align="left" style="font-size:0px;word-break:break-word;">' +
    //             '                        <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#55575d;">' +
    //             '                          <p style="line-height: 16px; text-align: left; color:#f5f5f5;font-size:12px;font-family:\'Nunito\',Helvetica,Arial,sans-serif; margin-bottom:12px;">' +
    //             'Tầng 20, Center Building, 1 Nguyễn Huy Tưởng, Q. Thanh Xuân, Hà Nội.</p>' +
    //             '                        </div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                  </tbody>' +
    //             '                </table>' +
    //             '              </div>' +
    //             '              <!--[if mso | IE]></td></tr></table><![endif]-->' +
    //             '            </td>' +
    //             '          </tr>' +
    //             '        </tbody>' +
    //             '      </table>' +
    //             '    </div>' +
    //             '    <div style="background:#ffffff;margin:0px auto;max-width:700px;">' +
    //             '      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#24346A;width:100%;">' +
    //             '        <tbody>' +
    //             '          <tr>' +
    //             '            <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">' +
    //             '              <div class="mj-column-per-50 mj-outlook-group-fix mj-mg5" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '               </div>' +
    //             '              <div class="mj-column-per-50 mj-outlook-group-fix mj-mg5" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">' +
    //             '                  <tbody>' +
    //             '                    <tr>' +
    //             '                      <td align="left" style="font-size:0px;word-break:break-word; padding-bottom: 24px;">' +
    //             '                        <div style="">' +
    //             '                          <p style="line-height: 19px; text-align: left; font-size:14px;color:#fcfcfc;font-family:\'Nunito\',Helvetica,Arial,sans-serif; display:flex;" class="mj-fs13"><img src="https://adi.admicro.vn/adt/tvc/files/images/1122/file_1668500171.png" alt="" style="padding-right: 8px;"><b><a style="color: #60BFD4;" href="https://pr-ims.admicro.vn/bao-gia">Xem báo giá Booking tại đây</a></b></p>' +
    //             '                        </div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                  </tbody>' +
    //             '                </table>' +
    //             '              </div>' +
    //             '            </td>' +
    //             '          </tr>' +
    //             '        </tbody>' +
    //             '      </table>' +
    //             '    </div>' +
    //             '  </div>' +
    //             '    <div style="background:#ffffff;margin:0px auto;max-width:700px;">' +
    //             '      <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;width:100%;">' +
    //             '        <tbody>' +
    //             '          <tr>' +
    //             '            <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">' +
    //             '              <div class="mj-column-per-100 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">' +
    //             '                <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">' +
    //             '                  <tbody>' +
    //             '                    <tr>' +
    //             '                      <td align="left" style="font-size:0px;padding:10px 25px;padding-top:5px;padding-bottom:0px;word-break:break-word;">' +
    //             '                        <div style="font-family:Arial, sans-serif;font-size:13px;line-height:22px;text-align:left;color:#000000;">' +
    //             '                          <p style="line-height: 16px; text-align: left; margin: 10px 0;font-size:12px;color:#000;font-family:\'Nunito\',Helvetica,Arial,sans-serif"><span style="color:#000;font-family:\'Nunito\',Helvetica,Arial,sans-serif"> <i>Đây là email tự động vui lòng không trả lời email này.</i> </span></p>' +
    //             '                        </div>' +
    //             '                      </td>' +
    //             '                    </tr>' +
    //             '                  </tbody>' +
    //             '                </table>' +
    //             '              </div>' +
    //             '            </td>' +
    //             '          </tr>' +
    //             '        </tbody>' +
    //             '      </table>' +
    //             '    </div>' +
    //             '  </div>' +
    //             '</body>' +
    //             '' +
    //             '</html>';
    //         var mailOptions = {
    //             from: 'Pr-ims Admicro <no-reply@admicro.vn>',
    //             to: nguoi_nhan,
    //             subject: subject,
    //             inReplyTo: messageId,
    //             html: content
    //         }
    //         transporter.sendMail(mailOptions, (error, data) => {
    //             if (error) {
    //                 resolve({
    //                     success: false,
    //                     message: error
    //                 });
    //             } else {
    //                 resolve({
    //                     success: true,
    //                     messageId: data.messageId,
    //                     message: "Successful"
    //                 });
    //             }
    //         });

    //     })
    // },
    mail_gui_yeu_cau_huy: function(param){
        return new Promise(function (resolve, reject) {
            try {
                var transporter     = def.mail_header;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder trân trọng thông báo yêu cầu hủy đã được <strong> tạo thành công.</strong> </div>
                        </td>
                    </tr> 
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Lý do hủy: <span style="color:red">`+ param.ly_do +`</span></div>
                        </td>
                    </tr> 
                `;

                let button = `<a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài</a>`;
                var content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    subject: param.tieu_de_mail,
                    inReplyTo: param.messageId,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_gui_yeu_cau_huy');
            }
        })
    },
    mail_hoan_thanh_yeu_cau_huy: function(param){
        return new Promise(function (resolve, reject) {
            try {
                var transporter     = def.mail_header;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                `;
                if(param.accept){
                    content_message += `
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                                <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder thông báo yêu cầu hủy ` + param.ma_yeu_cau_huy + ` đã được xử lý</div>
                            </td>
                        </tr> 
                `;
                }else{
                    content_message += `
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                                <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder thông báo yêu cầu hủy ` + param.ma_yeu_cau_huy + ` đã bị từ chối duyệt. Vui lòng liên hệ với Vận hành nếu có thắc mắc về kết quả.</div>
                            </td>
                        </tr>
                `;
                }
                let button = `<a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài và trao đổi </a>`;
                var content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    subject: param.tieu_de_mail,
                    inReplyTo: param.messageId,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_hoan_thanh_yeu_cau_huy');
            }
        })
    },
    mail_gui_yeu_cau_sua: function(param){
        return new Promise(function (resolve, reject) {
            try {
                var transporter     = def.mail_header;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder thông báo yêu cầu sửa ` + param.ma_yeu_cau_sua + ` của bài ` + param.ma_bai + ` đã được <b> tạo thành công.</b></div>
                        </td>
                    </tr> 
                `;

                let button = `<a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài và trao đổi </a>`;
                var content = webService.templateEmailNew(content_message, button);
            
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    subject: param.tieu_de_mail,
                    inReplyTo: param.messageId,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_gui_yeu_cau_sua');
            }
        })
    },
    mail_hoan_thanh_yeu_cau_sua: function(param){
        return new Promise(function (resolve, reject) {
            try {
                var transporter     = def.mail_header;
                let content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Kính gửi khách hàng: `+ param.ten_khach_hang +`</div>
                        </td>
                    </tr>
                `;
                if(param.accept){
                    content_message += `
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                                <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder thông báo yêu cầu sửa ` + param.ma_yeu_cau_sua + ` của bài ` + param.ma_bai + ` <b> đã được xử lý.</b></div>
                            </td>
                        </tr> 
                        
                `;
                }else{
                    content_message += `
                        <tr>
                            <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                                <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Media oder thông báo yêu cầu sửa ` + param.ma_yeu_cau_sua + ` của bài ` + param.ma_bai + ` <b> đã bị từ chối duyệt.</b></div>
                            </td>
                        </tr>
                `;
                }
                content_message += `
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;"><b>Vui lòng liên hệ với Vận hành nếu có thắc mắc về kết quả.</b></div>
                        </td>
                    </tr> 
                `;
                let button = `<a href="`+ param.link_chi_tiet +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;"> Xem chi tiết bài và trao đổi </a>`;
                var content = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Pr-ims Admicro <no-reply@admicro.vn>',
                    to: param.nguoi_nhan,
                    subject: param.tieu_de_mail,
                    inReplyTo: param.messageId,
                    html: content
                }
                transporter.sendMail(mailOptions, (error, data) => {
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    } else {
                        resolve({
                            success: true,
                            messageId: data.messageId,
                            message: "Successful"
                        });
                    }
                });
            } catch (error) {
                webService.addToLogService(error, 'mail_gui_yeu_cau_sua');
            }
        })
    }
}

module.exports = mailService;