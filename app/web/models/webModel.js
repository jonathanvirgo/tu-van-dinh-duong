var md5             = require('md5'),
    request         = require('request'),
    url             = require('url'),
    moment          = require('moment'),
    jwt             = require('jsonwebtoken'),
    db              = require('../../config/db'),
    crypto          = require('crypto'),
    jwtPrivateKey   = "4343636e4d354b45517159456534636d4e34344e4d4e50427371614575577451";

let webService = {
    removeVietnameseTones: function(str) {
        try {
            str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
            str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
            str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
            str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
            str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
            str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
            str = str.replace(/đ/g, "d");
            str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
            str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
            str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
            str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
            str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
            str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
            str = str.replace(/Đ/g, "D");
            // Some system encode vietnamese combining accent as individual utf-8 characters
            // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
            str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
            str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
            // Remove extra spaces
            // Bỏ các khoảng trắng liền nhau
            str = str.replace(/ + /g, " ");
            str = str.trim();
            // Remove punctuations
            // Bỏ dấu câu, kí tự đặc biệt
            str = str.replace(/!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g, " ");
            return str;
        } catch (error) {
            webService.addToLogService(error, "webService removeVietnameseTones");
            return;
        }
    },
    parseDay: function(time) {
        try {
            var date        = new Date(time);
            var month       = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
            var day         = (date.getDate()) < 10 ? '0' + (date.getDate()) : (date.getDate());
            var hours       = (date.getHours()) < 10 ? '0' + (date.getHours()) : (date.getHours());
            var minute      = (date.getMinutes) < 10 ? '0' + (date.getMinutes()) : (date.getMinutes());
            var dateformat  = day + '-' + month + '-' + date.getFullYear();
            return dateformat;
        } catch (error) {
            webService.addToLogService(error, "webService parseDay");
            return;
        }
    },
    addDays: function(days) {
        try {
            var date = new Date();
            date.setDate(date.getDate() + days);
            return webService.parseDay(date);
        } catch (error) {
            webService.addToLogService(error, "webService addDays");
            return;
        }
    },
    addToLogService: function(message, page_url) {
        try {
            let short_message = '';
            let full_message = '';
            if (typeof message === "string") {
                full_message = message;
            } else if (message instanceof Error) {
                full_message = JSON.stringify(message);
                short_message = message.message ? message.message : '';
            }else{
                full_message = JSON.stringify(message);
                short_message = message.sql ? message.sql : '';
            }
            webService.addRecordTable({short_message:short_message, full_message: full_message, page_url: page_url}, "log_err");
        } catch (error) {

        }
    },
    getStringRandom: function(length) {
        try {
            var result      = '';
            var characters  = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            var charactersLength = characters.length;
            for (var i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
            }
        } catch (error) {
            webService.addToLogService(error, "webService getStringRandom");
        }
    },
    fullUrl: function(req) {
        try {
            return url.format({
                protocol: req.protocol,
                host: req.get('host')
                // pathname: req.originalUrl
            });
        } catch (error) {
            webService.addToLogService(error, "webService fullUrl");
            return;
        }
    },
    createHeaderToken: function() {
        try {
            var data = {
                domain: domain,
                ctt: new Date()
            };
            return jwt.sign(data, jwtPrivateKey, {
                algorithm: 'HS512',
                expiresIn: 60 * 60
            });
        } catch (error) {
            webService.addToLogService(error, "webService createHeaderToken");
            return;
        }
    },
    loginFormToken: function(username, password) {
        try {
            var userData = {
                upass: md5(password),
                uname: username,
                ctt: new Date()
            };
            return jwt.sign(userData, jwtPrivateKey, {
                algorithm: 'HS256',
                expiresIn: 60 * 60
            });
        } catch (error) {
            webService.addToLogService(error, "webService addDays");
            return;
        }
    },
    readyToken: function(token) {
        try {
            return jwt.verify(token, jwtPrivateKey);
        } catch (err) {
            webService.addToLogService(err, "webService addDays");
            return;
        }
    },
    createFormToken: function(parameter) {
        try {
            var userData = {
                uname: parameter.username,
                pass: parameter.password,
                fname: parameter.full_name,
                mail: parameter.email,
                phone: parameter.phone,
                birthday: parameter.birthday,
                adr: parameter.address,
                gender: parseInt(parameter.gender),
                groupid: 0,
                saleid: 0,
                issale: 0,
                userview: 0,
                job: '',
                ctt: new Date()
            };
            return jwt.sign(userData, jwtPrivateKey, {
                algorithm: 'HS256',
                expiresIn: 60 * 60
            });
        } catch (error) {
            webService.addToLogService(err, "webService createFormToken");
            return;
        }
    },
    createSideBarFilter: function(req, type, perPage = 10) {
        try {
            var query       = url.parse(req.url, true).query,
                page        = isNaN(parseInt(query.page)) ? 1 : (parseInt(query.page) < 1 ? 1 : parseInt(query.page)),
                arrPromise  = [],
                listData    = {
                    search: {
                        skip: (page - 1) * perPage,
                        take: perPage,
                        page: page,
                        fromdate: "",
                        todate: "",
                        fromdate_statistic: "",
                        todate_statistic: "",
                        keyword: query.keyword == undefined ? "" : query.keyword,
                        name: query.cus_name == undefined ? "" : query.cus_name.trim(),
                        phone: query.cus_phone == undefined ? "" : query.cus_phone.trim(),
                        status_ids: query.status_ids == undefined ? "" : query.status_ids,
                        hospital_ids: query.hospital_ids == undefined ? "" : query.hospital_ids,
                        order_by: query.order_by == undefined ? 1 : parseInt(query.order_by),
                        book_date: query.book_date == undefined ? "" : query.book_date,
                        created_by: 0,
                        role_ids: [],
                        department_id: req.user ? req.user.department_id : null,
                        hospital_id: req.user ? req.user.hospital_id : null,
                        user_mail: req.user ? req.user.email : '',
                        user_phone: req.user ? req.user.phone : ''
                    },
                    requestUri: "",
                    hospitalIds: [],
                    statusIds: [],
                    error: [],
                    hospitals: [],
                    listStatus: webService.getExamineStatusOption()
                };

            if(req.user){
                listData.search.created_by = req.user.id;
                listData.search.role_ids   = req.user.role_id;
            }
            if (type == 1) {
                listData.requestUri = "/examine?keyword=" + listData.search.keyword;
            } else if(type == 2){
                listData.requestUri = "/examine/search?cus_name=" + listData.search.name + "&cus_phone=" + listData.search.phone;
            } else if(type == 3){ 
                listData.requestUri = "/search?keyword=" + listData.search.keyword;
            }else {
                listData.requestUri = "?keyword=" + listData.search.keyword;
            }

            if (listData.search.hospital_ids !== '') {
                var arr_hostpital = listData.search.hospital_ids.split(",");
                for (var i = 0; i < arr_hostpital.length; i++) {
                    if(!isNaN(parseInt(arr_hostpital[i]))){
                        listData.hospitalIds.push(parseInt(arr_hostpital[i]));
                    }
                }
                listData.requestUri += "&hospital_ids=" + listData.search.hospital_ids;
            }

            if (listData.search.status_ids !== '') {
                var arr_status = listData.search.status_ids.split(",");
                for (var i = 0; i < arr_status.length; i++) {
                    if(!isNaN(parseInt(arr_status[i]))){
                        listData.statusIds.push(parseInt(arr_status[i]));
                    }
                }
                listData.requestUri += "&status_ids=" + listData.search.status_ids;
            }
            if(type == 0){
                listData.search.fromdate_statistic = webService.addDays(-30);
                listData.search.todate_statistic   = webService.parseDay(new Date());
            }

            if (listData.search.book_date !== '') {
                if(listData.search.book_date.indexOf(' - ') == -1){
                    listData.search.fromdate = listData.search.book_date;
                } else {
                    var time = listData.search.book_date.split(' - ');
                    listData.search.fromdate = time[0];
                    listData.search.todate   = time[1];
                }
                listData.requestUri += "&book_date=" + listData.search.book_date;
            }

            if (listData.search.order_by !== '') {
                listData.requestUri += "&order_by=" + listData.search.order_by;
            }

            arrPromise.push(new Promise((resolve, reject) => {
                webService.getListTable('SELECT id AS value, name AS label FROM hospital WHERE active = 1', []).then(responseData =>{
                    if(responseData.success){
                        listData.hospitals = responseData.data;
                    }else{
                        listData.error.push(responseData.message);
                        webService.addToLogService(responseData.message, "createSideBarFilter get list hospital");
                    }
                    resolve();
                })
            }));

            return new Promise(function(resolve, reject) {
                Promise.all(arrPromise).then(function() {
                    resolve(listData);
                });
            });
        } catch (error) {
            webService.addToLogService(err, "webService createSideBarFilter");
            return;
        }
    },
    templateEmailNew: function(text_content, button) {
        try {
            var content_html = `
            <!doctype html>
            <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

            <head>
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700" rel="stylesheet" type="text/css">
            <style type="text/css">
                @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
                #outlook a {
                    padding: 0;
                }
                body {
                    margin: 0;
                    padding: 0;
                    -webkit-text-size-adjust: 100%;
                    -ms-text-size-adjust: 100%;
                }
                table,
                td {
                    border-collapse: collapse;
                    mso-table-lspace: 0pt;
                    mso-table-rspace: 0pt;
                }
                img {
                    border: 0;
                    height: auto;
                    line-height: 100%;
                    outline: none;
                    text-decoration: none;
                    -ms-interpolation-mode: bicubic;
                }
                p {
                    display: block;
                    margin: 0;
                }
                ul {
                    margin: 0;
                    padding-left: 28px;
                }
                ul li::marker {
                    color: #BDBDBD !important;
                    font-size: 1em;
                }
                @media only screen and (min-width:480px) {
                    .mj-column-per-100 {
                        width: 100% !important;
                        max-width: 100%;
                    }
                    .mj-column-per-50 {
                        width: 50% !important;
                        max-width: 50%;
                    }
                    .mj-column-per-40 {
                        width: 39% !important;
                        max-width: 39%;
                    }
                    .mj-column-per-60 {
                        width: 61% !important;
                        max-width: 61%;
                    }
                    .moz-text-html .mj-column-per-100 {
                        width: 100% !important;
                        max-width: 100%;
                    }
                    .moz-text-html .mj-column-per-50 {
                        width: 50% !important;
                        max-width: 50%;
                    }
                    .moz-text-html .mj-column-per-40 {
                        width: 39% !important;
                        max-width: 39%;
                    }
                    .moz-text-html .mj-column-per-60 {
                        width: 61% !important;
                        max-width: 61%;
                    }
                    }
                    @media only screen and (max-width:480px) {
                    table.mj-full-width-mobile {
                        width: 100% !important;
                    }
                    td.mj-full-width-mobile {
                        width: auto !important;
                    }
                    .mj-mg5 {
                        margin-top: 30px;
                    }
                    .mj-fs13 {
                        font-size: 13px !important;
                    }
                }
            </style>
            </head>
            <body style="word-spacing:normal;background-color:#F4F4F4;">
                <div style="background-color:#F4F4F4;">
                <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:700px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                    style="background:#ffffff;background-color:#ffffff;width:100%;">
                    <tbody>
                        <tr>
                        <td style="direction:ltr;font-size:0px;text-align:center;">
                            <div class="mj-column-per-100 mj-outlook-group-fix"
                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
                                width="100%">
                                <tbody>
                                <tr>
                                    <td align="center" style="font-size:0px;padding:24px 0px 13px 0; word-break:break-word;">
                                    <table border="0" cellpadding="0" cellspacing="0" role="presentation"
                                        style="border-collapse:collapse;border-spacing:0px;">
                                        <tbody>
                                        <tr>
                                            <td>
                                            <img height="auto"
                                                src=""
                                                style="border:0;display:block;outline:none;text-decoration:none;height:auto;max-width:100%;font-size:13px;"/>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:700px; padding-top: 20px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation"
                    style="background:#ffffff;background-color:#ffffff;width:100%;">
                    <tbody>
                        <tr>
                        <td style="direction:ltr;font-size:0px;text-align:center;">
                            <div class="mj-column-per-100 mj-outlook-group-fix"
                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                <tbody>` + text_content + `</tbody> 
                            </table>   
                            </div>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <div style="background:#ffffff;background-color:#ffffff;margin:0px auto;max-width:700px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;background-color:#ffffff;width:100%;">
                    <tbody>
                        <tr>
                        <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">
                            <div class="mj-column-per-100 mj-outlook-group-fix"
                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                <tbody>
                                <tr>
                                    <td align="center" style="font-size:0px;padding-bottom:34px;padding-top: 34px; word-break:break-word;">
                                        <div style="font-family:'Nunito', Helvetica, Arial, sans-serif;font-size:15px;line-height:1;text-align:center;color:#000000;">` 
                                        + button + `</div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                <div style="background:#24346A ;background-color:#24346A;margin:0px auto;max-width:700px;">
                    <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#24346A;background-color:#24346A;width:100%;">
                    <tbody>
                        <tr>
                        <td style="direction:ltr;font-size:0px;padding:24px 25px 24px 40px;text-align:center;">
                            <div class="mj-column-per-40 mj-outlook-group-fix" style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;" width="100%">
                                <tbody>
                                <tr>
                                    <td align="left" style="font-size:0px;word-break:break-word;">
                                    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#55575d; margin-bottom: 17px;">
                                        <p style="line-height: 19px; text-align: left; font-size:14px;color:#fcfcfc;font-family:'Nunito',Helvetica,Arial,sans-serif; display: flex;">
                                        <img src="https://adi.admicro.vn/adt/tvc/files/images/1122/phone_1668496873.png" alt="" style="padding-right: 8px;">
                                        <b>Tư vấn hỗ trợ</b>
                                        </p>
                                    </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" style="font-size:0px;word-break:break-word;">
                                    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#A4B4CB;">
                                        <p style="line-height: 16px; text-align: left; color:#A4B4CB;font-size:12px;font-family:'Nunito',Helvetica,Arial,sans-serif;margin-bottom: 10px;">
                                        Email: <span style="color:#fff;"> <a href="mailto:hotrodinhduongtoiuu@gmail.com" style="color: #fff; text-decoration: none;"> hotrodinhduongtoiuu@gmail.com</a></span> </p>
                                        <p style="line-height: 16px; text-align: left; color:#A4B4CB;font-size:12px;font-family:'Nunito',Helvetica,Arial,sans-serif;margin-bottom: 10px;">
                                        Hotline: <span style="color:#fff;">
                                            <a href="tel:0989402893" style="color:#fff; text-decoration: none;">0989402893</a>
                                        </span>
                                        </p>
                                    </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                            <div class="mj-column-per-60 mj-outlook-group-fix mj-mg5"
                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"width="100%">
                                <tbody>
                                <tr>
                                    <td align="left" style="font-size:0px;word-break:break-word;">
                                    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#55575d; margin-bottom: 17px;">
                                        <p style="line-height: 19px; text-align: left; font-size:14px;color:#fcfcfc;font-family:'Nunito',Helvetica,Arial,sans-serif; display:flex;">
                                        <img src="https://adi.admicro.vn/adt/tvc/files/images/1122/location_1668498012.png" alt="" style="padding-right: 8px;"><b>Địa chỉ</b>
                                        </p>
                                    </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" style="font-size:0px;word-break:break-word;">
                                    <div style="font-family:Arial, sans-serif;font-size:13px;line-height:1;text-align:left;color:#55575d;">
                                        <p style="line-height: 16px; text-align: left; color:#f5f5f5;font-size:12px;font-family:'Nunito Sans',Helvetica,Arial,sans-serif; margin-bottom:10px;">
                                        Tầng 20, Center Building, 1 Nguyễn Huy Tưởng, Q. Thanh Xuân, Hà Nội</p>
                                    </div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                            </div>
                        </td>
                        </tr>
                    </tbody>
                    </table>
                </div>
                </div>
                <div style="background:#ffffff;margin:0px auto;max-width:700px;">
                <table align="center" border="0" cellpadding="0" cellspacing="0" role="presentation" style="background:#ffffff;width:100%;">
                    <tbody>
                    <tr>
                        <td style="direction:ltr;font-size:0px;padding:0 0 0 0;text-align:center;">
                        <div class="mj-column-per-100 mj-outlook-group-fix"
                            style="font-size:0px;text-align:left;direction:ltr;display:inline-block;vertical-align:top;width:100%;">
                            <table border="0" cellpadding="0" cellspacing="0" role="presentation" style="vertical-align:top;"
                            width="100%">
                            <tbody>
                                <tr>
                                <td align="left" style="font-size:0px;padding:0px 40px;word-break:break-word;">
                                    <div>
                                    <p style="line-height: 18px; text-align: center; margin: 8px 0;font-size:13px;color:#333333;font-family:'Nunito',Helvetica,Arial,sans-serif">
                                        <span style="color:#333333;font-family:'Nunito',Helvetica,Arial,sans-serif"> <i>Đây là emailtự động. Vui lòng không trả lời email này.</i> </span>
                                    </p>
                                    </div>
                                </td>
                                </tr>
                            </tbody>
                            </table>
                        </div>
                        </td>
                    </tr>
                    </tbody>
                </table>
                </div>
            </body>
            </html>
            `;
            return content_html;  
        } catch (error) {
            webService.addToLogService(err, "webService templateEmailNew");
            return;
        }
    },
    countObjectSize: function(obj) {
        try {
            let size = 0, key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        } catch (error) {
            webService.addToLogService(err, "webService countObjectSize");
            return;
        }
    },
    updateRecordTable: function(param, condition, table){
        return new Promise((resolve, reject) => {
            db.get().getConnection(function(err, connection) {
                try {
                    if (err) {
                        resolve({
                            success: false,
                            message: err
                        });
                    }
                    let sql = 'UPDATE '+ table + ' SET ';
                    let paramSql = [];
                    if(typeof(param) == 'object'){
                        let j = 0;
                        for(let i in param){
                            if(j == 0){
                                sql += i +' = ?';
                                j = 1;
                            }else{
                                sql += ', ' + i +' = ?';
                            }
                            paramSql.push(param[i]);
                        }
                    }else{
                        sql += param;
                    }
                    
                    let l = 0;
                    for(let k in condition){
                        if(l == 0){
                            sql += ' WHERE ' + k + ' = ?';
                            l = 1;
                        }else{
                            sql += ' AND ' + k + ' = ?';
                        }
                        paramSql.push(condition[k]); 
                    }
                    let query = connection.query(sql, paramSql, function(error, results, fields) {
                        connection.release();
                        if (error) {
                            resolve({
                                success: false,
                                message: error
                            });
                        }else{
                            resolve({
                                success: true,
                                message: "Successful",
                                data: results
                            });
                        }
                    });
                } catch (error) {
                    webService.addToLogService(err, "webService updateRecordTable");
                    resolve({
                        success: false,
                        message: error
                    });
                }
            });
            // db.get().getConnection(function(err, connection) {
            //     try {
            //         if(err){

            //         }else{
            //             let sqlQueryLog = 'INSERT INTO log_info(type,examine_id,data) VALUES (?,?,?)';
            //             connection.query(sqlQueryLog, ['updateRecordTable: ' + table, table == 'examine' ? condition.id : null, JSON.stringify(param)], function(error, results, fields) {
            //                 connection.release();
            //             });
            //         }
            //     } catch (error) {
                    
            //     }
            // });
        });
    },
    addRecordTable: function(param, table, isCreated_at = false){
        return new Promise((resolve, reject) => {
            db.get().getConnection(function(err, connection) {
                if (err) {
                    resolve({
                        success: false,
                        message: err
                    });
                }
                //INSERT INTO pr_history_article(booking_id,name,path_cloud,type,version) VALUES (?,?,?,?,?)
                let sql = 'INSERT INTO '+ table +'(';
                let textVal = ') VALUES (';
                if(isCreated_at){
                    textVal = ',created_at) VALUES (';
                }
                let paramSql = [];
                let j = 0;
                for(var i in param){
                    if(j == 0){
                        sql += i ;
                        textVal += '?';
                        j = 1;
                    }else{
                        sql += ',' + i;
                        textVal += ',?';
                    }
                    paramSql.push(param[i]);
                }
                let sqlQuery = sql + textVal + ')';
                if(isCreated_at){
                    sqlQuery = sql + textVal + ',CURRENT_TIMESTAMP)';
                }
                let query = connection.query(sqlQuery, paramSql, function(error, results, fields) {
                    connection.release();
                    if (error) {
                        resolve({
                            success: false,
                            message: error
                        });
                    }else{
                        resolve({
                            success: true,
                            message: "Successful",
                            data: results
                        });
                    }
                });
            });
            // db.get().getConnection(function(err, connection) {
            //     try {
            //         if(err){

            //         }else{
            //             let sqlQueryLog = 'INSERT INTO log_info(type,examine_id,data) VALUES (?,?,?)';
            //             connection.query(sqlQueryLog, ['addRecordTable: ' + table, table == 'examine' ? results.insertId : null, JSON.stringify(param)], function(error, results, fields) {
            //                 connection.release();
            //             });
            //         }
            //     } catch (error) {
                    
            //     }
            // });
        })
    },
    deleteRecordTable: function(condition, table){
        return new Promise((resolve, reject) => {
            db.get().getConnection(function(err, connection) {
                try {
                    if (err) resolve({success: false, message: err});
                    let sql = 'DELETE FROM ' + table +' WHERE ';
                    let paramSql = [];
                    let j = 0;
                    for(var i in condition){
                        if(j == 0){
                            sql += i + ' = ?';
                            j = 1;
                        }else{
                            sql += ' AND ' + i + ' = ?';
                        }
                        paramSql.push(condition[i]);
                    }
                    connection.query(sql, paramSql, function(error, results, fields) {
                        connection.release();
                        if (error) resolve({success: false, message: error});
                        resolve({
                            success: true,
                            message: "Successful",
                            data: results
                        });
                    });
                } catch (error) {
                    webService.addToLogService(err, "webService deleteRecordTable");
                    resolve({
                        success: false,
                        message: error
                    });
                }
            });
        })
    },
    getListTable: function(sql, paramSql){
        return new Promise((resolve, reject) => {
            db.get().getConnection(function(err, connection) {
                try {
                    if (err) {
                        resolve({
                            success: false,
                            message: err
                        });
                    }
                    
                    let query = connection.query(sql, paramSql, function(error, results, fields) {
                        connection.release();
                        if (error) {
                            resolve({
                                success: false,
                                message: error
                            });
                        }
                        resolve({
                            success: true,
                            data: results,
                            message: "Successful"
                        });
                    });
                } catch (error) {
                    webService.addToLogService(err, "webService getListTable");
                    resolve({
                        success: false,
                        message: error
                    });
                }
            });
        });
    },
    getExamineStatusOption: function() {
        try {
            var result = {
                value: [1,2,3,4],
                data: []
            };
            for (var i = 0; i < result.value.length; i++) {
                result.data.push({
                    label: '<span class="badge badge-'+webService.examineStatusClass(result.value[i]).name+'">'+ webService.examineStatusClass(result.value[i]).value +'</span>',
                    value: result.value[i]
                });
            }
            return result;
        } catch (error) {
            webService.addToLogService(err, "webService getExamineStatusOption");
            return;
        }
    },
    examineStatusClass: function(status) {
        try {
            var color   = '',
                result  = {
                    name: '',
                    color: '',
                    value: ''
                }
           if (status == 1) {
                result.name  = 'gui-duyet';
                result.color = '#F2C144';
                result.value = 'Tiếp nhận';
            } else if (status == 2) {
                result.name  = 'cho-duyet';
                result.color = '#5BCD8F';
                result.value = 'Đang khám';
            } else if (status == 3) {
                result.name  = 'da-duyet';
                result.color = '#60BFD4';
                result.value = 'Hoàn thành';
            } else if (status == 4) {
                result.name  = 'da-huy';
                result.color = '#F2564C';
                result.value = 'Đã hủy';
            }
            return result;
        } catch (error) {
            webService.addToLogService(err, "webService examineStatusClass");
            return;
        }
    },
    addLogMail: function(result, param, is_send, sent_tries, type) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                try {
                    if (err) reject(err);
                    let sql = 'INSERT INTO log_mail(result, param, is_send, sent_tries, type) VALUES (?,?,?,?,?)';
                    connection.query(sql, [result, param, is_send, sent_tries, type], function(error, results, fields) {
                        connection.release();
                        if (error) reject(error);
                        resolve(results);
                    });
                } catch (error) {
                    webService.addToLogService(err, "webService addLogMail");
                    reject(error);
                }
            });
        });
    },
    // createCountId: function(hospital_id) {
    //     return new Promise(function(resolve, reject) {
    //         let date = moment().format('DDMMYY');
    //         let id   = '';
    //         let sqlIdCount = 'SELECT count_id FROM examine INNER JOIN department ON department.id = examine.department_id INNER JOIN hospital ON hospital.id = department.hospital_id WHERE hospital.id = ? ORDER BY examine.id DESC LIMIT 1';
    //         webService.getListTable(sqlIdCount, [hospital_id]).then(success => {
    //             if(success.success) {
    //                 if (success.data.length == 0) {
    //                     id = '001' + String(hospital_id).padStart(2, '0') + date;
    //                 } else {
    //                     if (success.data[0] && success.data[0].count_id) {
    //                         let id_count = success.data[0].count_id;
    //                         if (String(id_count).length >= 10) {
    //                             checkDate = id_count.slice(-6);
    //                             if (checkDate == date) {
    //                                 let number = parseInt((id_count.slice(0, id_count.length - 8)));
    //                                 number += 1;
    //                                 id = String(number).padStart(3, '0') + String(hospital_id).padStart(2, '0') + date;
    //                             } else {
    //                                 id = '001' + String(hospital_id).padStart(2, '0') + date;
    //                             }
    //                         } else {
    //                             id = '001' + String(hospital_id).padStart(2, '0') + date;
    //                         }
    //                     } else {
    //                         id = '001' + String(hospital_id).padStart(2, '0') + date;
    //                     }
    //                 }
    //                 resolve({success: true, id_count : id});
    //             }else{
    //                 resolve({success: false, message : success.message});
    //             }
    //         });
    //     });
    // },
    sha512: function(password, salt){
        var hash = crypto.createHmac('sha512', salt);
        hash.update(password);
        var value = hash.digest('hex');
        return {
            salt:salt,
            passwordHash:value
        };
    },
    saltHashPassword: function(userpassword) {
        var salt         = "salt!@#$%^&*())6";
        var passwordData = webService.sha512(userpassword, salt);
        return passwordData.passwordHash;
    },
    // xóa phần từ trong mảng
    removeItemArray: function(arr, val) {
        try {
            var j = 0;
            for (var i = 0, l = arr.length; i < l; i++) {
                if (arr[i] !== val) {
                    arr[j++] = arr[i];
                }
            }
            arr.length = j;
        } catch (error) {
            webService.addToLogService(error, "webService removeItemArray");
            return;
        }
    },
    // xóa phần từ object trong mảng bằng id
    removeItemArrayByIdObject: function(arr, id) {
        try {
            var j = 0;
            for (var i = 0, l = arr.length; i < l; i++) {
                if (arr[i].id !== id) {
                    arr[j++] = arr[i];
                }
            }
            arr.length = j;
        } catch (error) {
            webService.addToLogService(error, "webService removeItemArrayByIdObject");
            return;
        }
    },
    // xóa phần từ trùng trong mảng
    uniqueArray: function(arr){
        try {
            Array.from(new Set(arr));
        } catch (error) {
            webService.addToLogService(error, "webService uniqueArray");
            return; 
        }
    },
    //Tính tuổi từ năm sinh
    caculateYearOld: function(dateStr){
        try {
            if(dateStr){
                let cus_birthday = new Date(dateStr.split("-").reverse().join("-"));
                let now = new Date();
                return webService.diff_years(now, cus_birthday);
            }else{
                return 0
            }
        } catch (error) {
            webService.addToLogService(error, "webService caculateYearOld");
            return;
        }
    },
    diff_years: function(dt2, dt1) {
        let diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= (60 * 60 * 24);
        return Math.floor(Math.abs(diff/365.25));
    },
    addPermitTable: function(str, user){
        try {
            if(user.role_id.includes(1) || user.role_id.includes(3)){
                //Nếu là admin load hết
                return {sqlQuery :str, paramSql: []}
            }else if(user.role_id.includes(5)){
                //Nếu là quản lý load theo viện
                str += " AND (hospital_id = ? OR share = 1)";
                return {sqlQuery :str, paramSql: [user.hospital_id]}
            }else if(user.role_id.includes(4)){
                str += " AND (created_by = ? OR share = 1)";
                return {sqlQuery :str, paramSql: [user.id]}
            }
        } catch (error) {
            
        }
    },
    callApiAll: function(linkUrl, parameter, headers, method) {
        return new Promise(function(resolve, reject) {
            try {
                var options = {
                    'method': method,
                    'url': linkUrl,
                    'headers': headers,
                    formData: parameter
                };
                console.log("callApiAll", linkUrl);
                request(options, function(error, response) {
                    if (error) {
                        resolve({
                            success: false,
                            message: JSON.stringify(error)
                        });
                    }
                    if(response && response.statusCode){
                        if (response.statusCode !== 200) {
                            resolve({
                                success: false,
                                message: "Kết nối vừa bị gián đoạn. Vui lòng thử lại."
                            });
                        } else {
                            var responseData = JSON.parse(response.body);
                            resolve({
                                success: true,
                                data: responseData,
                                message: "Success!"
                            });
                        } 
                    } else {
                        resolve({
                            success: false,
                            message: "Kết nối vừa bị gián đoạn. Vui lòng thử lại."
                        });
                    }
                });
            } catch (error) {
                console.log("callApiAll error", error);
            }
        });
    },
    getDataWeather(){
        let data = {
            "cod": "200",
            "message": 0,
            "cnt": 40,
            "list": [
                {
                    "dt": 1683277200,
                    "main": {
                        "temp": 36,
                        "feels_like": 39.14,
                        "temp_min": 36,
                        "temp_max": 38.67,
                        "pressure": 994,
                        "sea_level": 994,
                        "grnd_level": 993,
                        "humidity": 40,
                        "temp_kf": -2.67
                    },
                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02d"
                        }
                    ],
                    "clouds": {
                        "all": 12
                    },
                    "wind": {
                        "speed": 7.25,
                        "deg": 129,
                        "gust": 7.75
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-05 09:00:00"
                },
                {
                    "dt": 1683288000,
                    "main": {
                        "temp": 33.93,
                        "feels_like": 38.58,
                        "temp_min": 29.8,
                        "temp_max": 33.93,
                        "pressure": 995,
                        "sea_level": 995,
                        "grnd_level": 995,
                        "humidity": 51,
                        "temp_kf": 4.13
                    },
                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02n"
                        }
                    ],
                    "clouds": {
                        "all": 12
                    },
                    "wind": {
                        "speed": 5.55,
                        "deg": 112,
                        "gust": 9.08
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-05 12:00:00"
                },
                {
                    "dt": 1683298800,
                    "main": {
                        "temp": 30.29,
                        "feels_like": 35.25,
                        "temp_min": 27.44,
                        "temp_max": 30.29,
                        "pressure": 997,
                        "sea_level": 997,
                        "grnd_level": 997,
                        "humidity": 68,
                        "temp_kf": 2.85
                    },
                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02n"
                        }
                    ],
                    "clouds": {
                        "all": 20
                    },
                    "wind": {
                        "speed": 4.99,
                        "deg": 120,
                        "gust": 10.06
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-05 15:00:00"
                },
                {
                    "dt": 1683309600,
                    "main": {
                        "temp": 26.94,
                        "feels_like": 29.88,
                        "temp_min": 26.94,
                        "temp_max": 26.94,
                        "pressure": 998,
                        "sea_level": 998,
                        "grnd_level": 996,
                        "humidity": 83,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02n"
                        }
                    ],
                    "clouds": {
                        "all": 16
                    },
                    "wind": {
                        "speed": 4.28,
                        "deg": 132,
                        "gust": 9.64
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-05 18:00:00"
                },
                {
                    "dt": 1683320400,
                    "main": {
                        "temp": 26.04,
                        "feels_like": 26.04,
                        "temp_min": 26.04,
                        "temp_max": 26.04,
                        "pressure": 998,
                        "sea_level": 998,
                        "grnd_level": 997,
                        "humidity": 89,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01n"
                        }
                    ],
                    "clouds": {
                        "all": 9
                    },
                    "wind": {
                        "speed": 2.67,
                        "deg": 103,
                        "gust": 5.78
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-05 21:00:00"
                },
                {
                    "dt": 1683331200,
                    "main": {
                        "temp": 27.61,
                        "feels_like": 31.68,
                        "temp_min": 27.61,
                        "temp_max": 27.61,
                        "pressure": 1000,
                        "sea_level": 1000,
                        "grnd_level": 999,
                        "humidity": 84,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02d"
                        }
                    ],
                    "clouds": {
                        "all": 14
                    },
                    "wind": {
                        "speed": 3.15,
                        "deg": 127,
                        "gust": 4.56
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-06 00:00:00"
                },
                {
                    "dt": 1683342000,
                    "main": {
                        "temp": 34.01,
                        "feels_like": 40.98,
                        "temp_min": 34.01,
                        "temp_max": 34.01,
                        "pressure": 1000,
                        "sea_level": 1000,
                        "grnd_level": 999,
                        "humidity": 57,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 802,
                            "main": "Clouds",
                            "description": "scattered clouds",
                            "icon": "03d"
                        }
                    ],
                    "clouds": {
                        "all": 38
                    },
                    "wind": {
                        "speed": 1.95,
                        "deg": 149,
                        "gust": 2.47
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-06 03:00:00"
                },
                {
                    "dt": 1683352800,
                    "main": {
                        "temp": 39.44,
                        "feels_like": 45.79,
                        "temp_min": 39.44,
                        "temp_max": 39.44,
                        "pressure": 997,
                        "sea_level": 997,
                        "grnd_level": 995,
                        "humidity": 38,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 801,
                            "main": "Clouds",
                            "description": "few clouds",
                            "icon": "02d"
                        }
                    ],
                    "clouds": {
                        "all": 19
                    },
                    "wind": {
                        "speed": 2.44,
                        "deg": 137,
                        "gust": 3.24
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-06 06:00:00"
                },
                {
                    "dt": 1683363600,
                    "main": {
                        "temp": 37.98,
                        "feels_like": 44.98,
                        "temp_min": 37.98,
                        "temp_max": 37.98,
                        "pressure": 995,
                        "sea_level": 995,
                        "grnd_level": 993,
                        "humidity": 45,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01d"
                        }
                    ],
                    "clouds": {
                        "all": 3
                    },
                    "wind": {
                        "speed": 6.52,
                        "deg": 122,
                        "gust": 5.72
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-06 09:00:00"
                },
                {
                    "dt": 1683374400,
                    "main": {
                        "temp": 29.84,
                        "feels_like": 35.61,
                        "temp_min": 29.84,
                        "temp_max": 29.84,
                        "pressure": 997,
                        "sea_level": 997,
                        "grnd_level": 996,
                        "humidity": 74,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 800,
                            "main": "Clear",
                            "description": "clear sky",
                            "icon": "01n"
                        }
                    ],
                    "clouds": {
                        "all": 2
                    },
                    "wind": {
                        "speed": 5.49,
                        "deg": 136,
                        "gust": 8.85
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-06 12:00:00"
                },
                {
                    "dt": 1683385200,
                    "main": {
                        "temp": 27.92,
                        "feels_like": 32.2,
                        "temp_min": 27.92,
                        "temp_max": 27.92,
                        "pressure": 999,
                        "sea_level": 999,
                        "grnd_level": 997,
                        "humidity": 82,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 802,
                            "main": "Clouds",
                            "description": "scattered clouds",
                            "icon": "03n"
                        }
                    ],
                    "clouds": {
                        "all": 31
                    },
                    "wind": {
                        "speed": 4.56,
                        "deg": 139,
                        "gust": 9.52
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-06 15:00:00"
                },
                {
                    "dt": 1683396000,
                    "main": {
                        "temp": 26.77,
                        "feels_like": 30,
                        "temp_min": 26.77,
                        "temp_max": 26.77,
                        "pressure": 998,
                        "sea_level": 998,
                        "grnd_level": 996,
                        "humidity": 89,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 802,
                            "main": "Clouds",
                            "description": "scattered clouds",
                            "icon": "03n"
                        }
                    ],
                    "clouds": {
                        "all": 29
                    },
                    "wind": {
                        "speed": 4.65,
                        "deg": 137,
                        "gust": 9.84
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-06 18:00:00"
                },
                {
                    "dt": 1683406800,
                    "main": {
                        "temp": 26.97,
                        "feels_like": 30.65,
                        "temp_min": 26.97,
                        "temp_max": 26.97,
                        "pressure": 999,
                        "sea_level": 999,
                        "grnd_level": 997,
                        "humidity": 90,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 803,
                            "main": "Clouds",
                            "description": "broken clouds",
                            "icon": "04n"
                        }
                    ],
                    "clouds": {
                        "all": 65
                    },
                    "wind": {
                        "speed": 3.31,
                        "deg": 111,
                        "gust": 6.15
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-06 21:00:00"
                },
                {
                    "dt": 1683417600,
                    "main": {
                        "temp": 27.7,
                        "feels_like": 32.21,
                        "temp_min": 27.7,
                        "temp_max": 27.7,
                        "pressure": 1002,
                        "sea_level": 1002,
                        "grnd_level": 1001,
                        "humidity": 86,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 73
                    },
                    "wind": {
                        "speed": 3.82,
                        "deg": 76,
                        "gust": 4.96
                    },
                    "visibility": 10000,
                    "pop": 0.2,
                    "rain": {
                        "3h": 0.15
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-07 00:00:00"
                },
                {
                    "dt": 1683428400,
                    "main": {
                        "temp": 29.65,
                        "feels_like": 35.6,
                        "temp_min": 29.65,
                        "temp_max": 29.65,
                        "pressure": 1004,
                        "sea_level": 1004,
                        "grnd_level": 1003,
                        "humidity": 76,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 99
                    },
                    "wind": {
                        "speed": 3.03,
                        "deg": 72,
                        "gust": 4.37
                    },
                    "visibility": 10000,
                    "pop": 0.41,
                    "rain": {
                        "3h": 0.38
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-07 03:00:00"
                },
                {
                    "dt": 1683439200,
                    "main": {
                        "temp": 30.86,
                        "feels_like": 37.52,
                        "temp_min": 30.86,
                        "temp_max": 30.86,
                        "pressure": 1003,
                        "sea_level": 1003,
                        "grnd_level": 1001,
                        "humidity": 71,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 3.56,
                        "deg": 103,
                        "gust": 4.38
                    },
                    "visibility": 10000,
                    "pop": 0.55,
                    "rain": {
                        "3h": 0.53
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-07 06:00:00"
                },
                {
                    "dt": 1683450000,
                    "main": {
                        "temp": 28.94,
                        "feels_like": 33.55,
                        "temp_min": 28.94,
                        "temp_max": 28.94,
                        "pressure": 1003,
                        "sea_level": 1003,
                        "grnd_level": 1001,
                        "humidity": 75,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 91
                    },
                    "wind": {
                        "speed": 4.39,
                        "deg": 26,
                        "gust": 5.38
                    },
                    "visibility": 10000,
                    "pop": 0.88,
                    "rain": {
                        "3h": 1.69
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-07 09:00:00"
                },
                {
                    "dt": 1683460800,
                    "main": {
                        "temp": 24.9,
                        "feels_like": 25.46,
                        "temp_min": 24.9,
                        "temp_max": 24.9,
                        "pressure": 1006,
                        "sea_level": 1006,
                        "grnd_level": 1005,
                        "humidity": 77,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10n"
                        }
                    ],
                    "clouds": {
                        "all": 96
                    },
                    "wind": {
                        "speed": 3.95,
                        "deg": 35,
                        "gust": 8.29
                    },
                    "visibility": 10000,
                    "pop": 0.94,
                    "rain": {
                        "3h": 0.54
                    },
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-07 12:00:00"
                },
                {
                    "dt": 1683471600,
                    "main": {
                        "temp": 24.03,
                        "feels_like": 24.45,
                        "temp_min": 24.03,
                        "temp_max": 24.03,
                        "pressure": 1007,
                        "sea_level": 1007,
                        "grnd_level": 1006,
                        "humidity": 75,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 6.13,
                        "deg": 40,
                        "gust": 10.89
                    },
                    "visibility": 10000,
                    "pop": 0.28,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-07 15:00:00"
                },
                {
                    "dt": 1683482400,
                    "main": {
                        "temp": 23.11,
                        "feels_like": 23.46,
                        "temp_min": 23.11,
                        "temp_max": 23.11,
                        "pressure": 1008,
                        "sea_level": 1008,
                        "grnd_level": 1006,
                        "humidity": 76,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 5.12,
                        "deg": 34,
                        "gust": 9.34
                    },
                    "visibility": 10000,
                    "pop": 0.48,
                    "rain": {
                        "3h": 0.11
                    },
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-07 18:00:00"
                },
                {
                    "dt": 1683493200,
                    "main": {
                        "temp": 21.37,
                        "feels_like": 21.78,
                        "temp_min": 21.37,
                        "temp_max": 21.37,
                        "pressure": 1008,
                        "sea_level": 1008,
                        "grnd_level": 1007,
                        "humidity": 85,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 4.06,
                        "deg": 16,
                        "gust": 9.47
                    },
                    "visibility": 10000,
                    "pop": 0.93,
                    "rain": {
                        "3h": 1.65
                    },
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-07 21:00:00"
                },
                {
                    "dt": 1683504000,
                    "main": {
                        "temp": 21.08,
                        "feels_like": 21.44,
                        "temp_min": 21.08,
                        "temp_max": 21.08,
                        "pressure": 1010,
                        "sea_level": 1010,
                        "grnd_level": 1008,
                        "humidity": 84,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 4.67,
                        "deg": 20,
                        "gust": 9.77
                    },
                    "visibility": 10000,
                    "pop": 0.9,
                    "rain": {
                        "3h": 1.05
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-08 00:00:00"
                },
                {
                    "dt": 1683514800,
                    "main": {
                        "temp": 21.06,
                        "feels_like": 21.39,
                        "temp_min": 21.06,
                        "temp_max": 21.06,
                        "pressure": 1012,
                        "sea_level": 1012,
                        "grnd_level": 1010,
                        "humidity": 83,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 4.22,
                        "deg": 18,
                        "gust": 8.81
                    },
                    "visibility": 10000,
                    "pop": 0.72,
                    "rain": {
                        "3h": 0.94
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-08 03:00:00"
                },
                {
                    "dt": 1683525600,
                    "main": {
                        "temp": 21.19,
                        "feels_like": 21.53,
                        "temp_min": 21.19,
                        "temp_max": 21.19,
                        "pressure": 1010,
                        "sea_level": 1010,
                        "grnd_level": 1009,
                        "humidity": 83,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 3.87,
                        "deg": 18,
                        "gust": 7.04
                    },
                    "visibility": 10000,
                    "pop": 1,
                    "rain": {
                        "3h": 1.03
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-08 06:00:00"
                },
                {
                    "dt": 1683536400,
                    "main": {
                        "temp": 21.57,
                        "feels_like": 21.9,
                        "temp_min": 21.57,
                        "temp_max": 21.57,
                        "pressure": 1008,
                        "sea_level": 1008,
                        "grnd_level": 1007,
                        "humidity": 81,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 3.33,
                        "deg": 14,
                        "gust": 6.45
                    },
                    "visibility": 10000,
                    "pop": 0.47,
                    "rain": {
                        "3h": 0.13
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-08 09:00:00"
                },
                {
                    "dt": 1683547200,
                    "main": {
                        "temp": 21.36,
                        "feels_like": 21.74,
                        "temp_min": 21.36,
                        "temp_max": 21.36,
                        "pressure": 1010,
                        "sea_level": 1010,
                        "grnd_level": 1009,
                        "humidity": 84,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.9,
                        "deg": 348,
                        "gust": 4.24
                    },
                    "visibility": 10000,
                    "pop": 0.46,
                    "rain": {
                        "3h": 0.33
                    },
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-08 12:00:00"
                },
                {
                    "dt": 1683558000,
                    "main": {
                        "temp": 21.22,
                        "feels_like": 21.62,
                        "temp_min": 21.22,
                        "temp_max": 21.22,
                        "pressure": 1011,
                        "sea_level": 1011,
                        "grnd_level": 1010,
                        "humidity": 85,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 0.75,
                        "deg": 28,
                        "gust": 2.18
                    },
                    "visibility": 10000,
                    "pop": 0.21,
                    "rain": {
                        "3h": 0.15
                    },
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-08 15:00:00"
                },
                {
                    "dt": 1683568800,
                    "main": {
                        "temp": 21.01,
                        "feels_like": 21.39,
                        "temp_min": 21.01,
                        "temp_max": 21.01,
                        "pressure": 1010,
                        "sea_level": 1010,
                        "grnd_level": 1008,
                        "humidity": 85,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.69,
                        "deg": 17,
                        "gust": 2.68
                    },
                    "visibility": 10000,
                    "pop": 0.01,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-08 18:00:00"
                },
                {
                    "dt": 1683579600,
                    "main": {
                        "temp": 20.48,
                        "feels_like": 20.91,
                        "temp_min": 20.48,
                        "temp_max": 20.48,
                        "pressure": 1010,
                        "sea_level": 1010,
                        "grnd_level": 1008,
                        "humidity": 89,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.91,
                        "deg": 19,
                        "gust": 3.41
                    },
                    "visibility": 10000,
                    "pop": 0.32,
                    "rain": {
                        "3h": 0.19
                    },
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-08 21:00:00"
                },
                {
                    "dt": 1683590400,
                    "main": {
                        "temp": 20.73,
                        "feels_like": 21.16,
                        "temp_min": 20.73,
                        "temp_max": 20.73,
                        "pressure": 1012,
                        "sea_level": 1012,
                        "grnd_level": 1010,
                        "humidity": 88,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.95,
                        "deg": 10,
                        "gust": 3.69
                    },
                    "visibility": 10000,
                    "pop": 0.27,
                    "rain": {
                        "3h": 0.26
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-09 00:00:00"
                },
                {
                    "dt": 1683601200,
                    "main": {
                        "temp": 21.3,
                        "feels_like": 21.71,
                        "temp_min": 21.3,
                        "temp_max": 21.3,
                        "pressure": 1012,
                        "sea_level": 1012,
                        "grnd_level": 1011,
                        "humidity": 85,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.83,
                        "deg": 14,
                        "gust": 2.8
                    },
                    "visibility": 10000,
                    "pop": 0.27,
                    "rain": {
                        "3h": 0.22
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-09 03:00:00"
                },
                {
                    "dt": 1683612000,
                    "main": {
                        "temp": 21.68,
                        "feels_like": 22.15,
                        "temp_min": 21.68,
                        "temp_max": 21.68,
                        "pressure": 1010,
                        "sea_level": 1010,
                        "grnd_level": 1009,
                        "humidity": 86,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.39,
                        "deg": 6,
                        "gust": 1.82
                    },
                    "visibility": 10000,
                    "pop": 0.4,
                    "rain": {
                        "3h": 0.87
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-09 06:00:00"
                },
                {
                    "dt": 1683622800,
                    "main": {
                        "temp": 23.31,
                        "feels_like": 23.81,
                        "temp_min": 23.31,
                        "temp_max": 23.31,
                        "pressure": 1008,
                        "sea_level": 1008,
                        "grnd_level": 1007,
                        "humidity": 81,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 99
                    },
                    "wind": {
                        "speed": 1.95,
                        "deg": 64,
                        "gust": 2.38
                    },
                    "visibility": 10000,
                    "pop": 0.25,
                    "rain": {
                        "3h": 0.14
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-09 09:00:00"
                },
                {
                    "dt": 1683633600,
                    "main": {
                        "temp": 22.26,
                        "feels_like": 22.81,
                        "temp_min": 22.26,
                        "temp_max": 22.26,
                        "pressure": 1009,
                        "sea_level": 1009,
                        "grnd_level": 1007,
                        "humidity": 87,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04n"
                        }
                    ],
                    "clouds": {
                        "all": 99
                    },
                    "wind": {
                        "speed": 1.6,
                        "deg": 86,
                        "gust": 2.34
                    },
                    "visibility": 10000,
                    "pop": 0,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-09 12:00:00"
                },
                {
                    "dt": 1683644400,
                    "main": {
                        "temp": 22.27,
                        "feels_like": 22.85,
                        "temp_min": 22.27,
                        "temp_max": 22.27,
                        "pressure": 1010,
                        "sea_level": 1010,
                        "grnd_level": 1009,
                        "humidity": 88,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.05,
                        "deg": 153,
                        "gust": 1.79
                    },
                    "visibility": 10000,
                    "pop": 0.02,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-09 15:00:00"
                },
                {
                    "dt": 1683655200,
                    "main": {
                        "temp": 22.16,
                        "feels_like": 22.78,
                        "temp_min": 22.16,
                        "temp_max": 22.16,
                        "pressure": 1009,
                        "sea_level": 1009,
                        "grnd_level": 1007,
                        "humidity": 90,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 0.11,
                        "deg": 258,
                        "gust": 0.92
                    },
                    "visibility": 10000,
                    "pop": 0.01,
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-09 18:00:00"
                },
                {
                    "dt": 1683666000,
                    "main": {
                        "temp": 21.84,
                        "feels_like": 22.51,
                        "temp_min": 21.84,
                        "temp_max": 21.84,
                        "pressure": 1009,
                        "sea_level": 1009,
                        "grnd_level": 1008,
                        "humidity": 93,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10n"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.26,
                        "deg": 17,
                        "gust": 1.94
                    },
                    "visibility": 10000,
                    "pop": 0.48,
                    "rain": {
                        "3h": 0.41
                    },
                    "sys": {
                        "pod": "n"
                    },
                    "dt_txt": "2023-05-09 21:00:00"
                },
                {
                    "dt": 1683676800,
                    "main": {
                        "temp": 22.16,
                        "feels_like": 22.89,
                        "temp_min": 22.16,
                        "temp_max": 22.16,
                        "pressure": 1011,
                        "sea_level": 1011,
                        "grnd_level": 1009,
                        "humidity": 94,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.47,
                        "deg": 15,
                        "gust": 2.47
                    },
                    "visibility": 10000,
                    "pop": 0.45,
                    "rain": {
                        "3h": 0.82
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-10 00:00:00"
                },
                {
                    "dt": 1683687600,
                    "main": {
                        "temp": 24.09,
                        "feels_like": 24.77,
                        "temp_min": 24.09,
                        "temp_max": 24.09,
                        "pressure": 1011,
                        "sea_level": 1011,
                        "grnd_level": 1010,
                        "humidity": 85,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 804,
                            "main": "Clouds",
                            "description": "overcast clouds",
                            "icon": "04d"
                        }
                    ],
                    "clouds": {
                        "all": 100
                    },
                    "wind": {
                        "speed": 1.46,
                        "deg": 14,
                        "gust": 1.55
                    },
                    "visibility": 10000,
                    "pop": 0.13,
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-10 03:00:00"
                },
                {
                    "dt": 1683698400,
                    "main": {
                        "temp": 27.45,
                        "feels_like": 30.07,
                        "temp_min": 27.45,
                        "temp_max": 27.45,
                        "pressure": 1009,
                        "sea_level": 1009,
                        "grnd_level": 1008,
                        "humidity": 74,
                        "temp_kf": 0
                    },
                    "weather": [
                        {
                            "id": 500,
                            "main": "Rain",
                            "description": "light rain",
                            "icon": "10d"
                        }
                    ],
                    "clouds": {
                        "all": 98
                    },
                    "wind": {
                        "speed": 1.71,
                        "deg": 26,
                        "gust": 1.47
                    },
                    "visibility": 10000,
                    "pop": 0.23,
                    "rain": {
                        "3h": 0.18
                    },
                    "sys": {
                        "pod": "d"
                    },
                    "dt_txt": "2023-05-10 06:00:00"
                }
            ],
            "city": {
                "id": 1581130,
                "name": "Hanoi",
                "coord": {
                    "lat": 21.0245,
                    "lon": 105.8412
                },
                "country": "VN",
                "population": 1431270,
                "timezone": 25200,
                "sunrise": 1683239050,
                "sunset": 1683285751
            }
        };
        try {
            let listWeatherDate = [];
            let weatherDate = [];
            let numberDate = 0;
            let date = '';
            for(let [index, item] of data.list.entries()){
                if(numberDate == 0){
                    date = moment.unix(item.dt).format('D-M');
                    weatherDate = {
                        date:       date, 
                        listTemp:   [item.main.temp], 
                        listTempMin: [item.main.temp_min], 
                        listTempMax: [item.main.temp_max]
                    };
                    numberDate++;
                }else{
                    if(date == moment.unix(item.dt).utc().format('D-M')){
                        weatherDate.listTemp.push(item.main.temp);
                        weatherDate.listTempMin.push(item.main.temp_min);
                        weatherDate.listTempMax.push(item.main.temp_max);
                    }else{
                        listWeatherDate.push(weatherDate);
                        weatherDate = [];
                        weatherDate.length = 0;
                        date = moment.unix(item.dt).format('D-M');
                        weatherDate = {
                            date:       date, 
                            listTemp:   [item.main.temp], 
                            listTempMin: [item.main.temp_min], 
                            listTempMax: [item.main.temp_max]
                        };
                        numberDate++;
                    }
                }
                if(index == (data.list.length - 1)){
                    listWeatherDate.push(weatherDate);    
                }
            }
            console.log("listWeatherDate", listWeatherDate);
        } catch (error) {
            console.log("getDataWeather error", error);   
        }
    },
    roundStep(value, step) {
        step || (step = 1.0);
        var inv = 1.0 / step;
        return Math.round(value * inv) / inv;
    }
}

module.exports = webService;