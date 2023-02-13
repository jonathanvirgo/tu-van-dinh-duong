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
    mail_signup: function (email, activeaccount) {
        return new Promise(function (resolve, reject) {
            var transporter     = def.mail_header;
            var content_message = `
                <p>Bạn nhận được thông báo này vì bạn (hoặc người khác) đã yêu cầu tạo tài khoản từ email của bạn.</p>
                <p>Vui lòng nhấp vào liên kết sau hoặc dán liên kết này vào trình duyệt của bạn để hoàn tất quy trình kích hoạt tài khoản</p>
            `;

            let button = `
                    <a href="`+ activeaccount +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;">Kích hoạt ngay</a>
            `;
            var content     = webService.templateEmailNew(content_message, button);
            var mailOptions = {
                from: 'Dinh Dưỡng hỗ trợ',
                to: email,
                subject: "DDHT - Kích hoạt tài khoản",
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
        })
    },
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
    }
}

module.exports = mailService;