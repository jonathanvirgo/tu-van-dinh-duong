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
            try {
                var transporter     = def.mail_header;
                var content_message = `
                    <tr>
                        <td align="left" style="font-size:0px;padding:8px 40px;word-break:break-word; margin-top: 24px;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:18px;font-weight:bold;line-height:24.55px;text-align:left;color:#333333;">Bạn nhận được thông báo này vì bạn đã yêu cầu tạo tài khoản từ email này.</div>
                        </td>
                    </tr>
                    <tr>
                        <td align="left" style="font-size:0px;padding:0 40px;word-break:break-word;">
                            <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:14px;font-weight:400;line-height:19.1px;text-align:left;color:#333333;">Vui lòng nhấp vào liên kết sau để hoàn tất quy trình kích hoạt tài khoản</div>
                        </td>
                    </tr>
                `;

                let button = `
                        <a href="`+ activeaccount +`" style="text-decoration:none; color:#fff; background-color:#4A69D2; padding:10px 30px; border-radius:6px; font-family:'Nunito',Helvetica,Arial,sans-serif; text-transform: uppercase;">Kích hoạt ngay</a>
                `;
                var content     = webService.templateEmailNew(content_message, button);
                var mailOptions = {
                    from: 'Dinh Dưỡng hỗ trợ',
                    to: email,
                    subject: "<no-reply> DDHT - Kích hoạt tài khoản",
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
                webService.addToLogService(error, 'mail_signup');
                resolve({
                    success: false,
                    message: error
                });
            }
        });
    }
}

module.exports = mailService;