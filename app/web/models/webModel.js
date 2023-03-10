const { response } = require('express');

var md5             = require('md5'),
    request         = require('request'),
    url             = require('url'),
    moment          = require('moment'),
    jwt             = require('jsonwebtoken'),
    db              = require('../../config/db'),
    logService      = require('../../admin/models/logModel'),
    crypto          = require('crypto'),
    jwtPrivateKey   = "4343636e4d354b45517159456534636d4e34344e4d4e50427371614575577451";
const docx = require("docx");
const { AlignmentType, HeadingLevel, Paragraph, TabStopPosition, TabStopType, TextRun } = docx;

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
            console.log("addToLogService catch", error);
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
                        keyword: query.keyword == undefined ? "" : query.keyword,
                        status_ids: query.status_ids == undefined ? "" : query.status_ids,
                        hospital_ids: query.hospital_ids == undefined ? "" : query.hospital_ids,
                        order_by: query.order_by == undefined ? 1 : parseInt(query.order_by),
                        created_by: 0,
                        role_ids: [],
                        department_id: req.user.department_id,
                        hospital_id: req.user.hospital_id,
                        user_mail: req.user.email,
                        user_phone: req.user.phone
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
            } else {
                listData.requestUri = "?keyword=" + listData.search.keyword;
            }

            if (listData.search.order_by !== '') {
                listData.requestUri += "&order_by=" + listData.search.order_by;
            }

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
                        }
                        resolve({
                            success: true,
                            message: "Successful",
                            data: results
                        });
                    });
                } catch (error) {
                    webService.addToLogService(err, "webService updateRecordTable");
                    resolve({
                        success: false,
                        message: error
                    });
                }
            });
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
                    }
                    resolve({
                        success: true,
                        message: "Successful",
                        data: results
                    });
                });
                console.log("addRecordTable", query.sql);
            });
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
                    console.log("getListTable", query.sql);
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
    createCountId: function(hospital_id) {
        return new Promise(function(resolve, reject) {
            let date = moment().format('DDMMYY');
            let id   = '';
            let sqlIdCount = 'SELECT count_id FROM examine INNER JOIN department ON department.id = examine.department_id INNER JOIN hospital ON hospital.id = department.hospital_id WHERE hospital.id = ? ORDER BY examine.id DESC LIMIT 1';
            webService.getListTable(sqlIdCount, [hospital_id]).then(success => {
                console.log("sqlIdCount", success);
                if(success.success) {
                    if (success.data.length == 0) {
                        id = '001' + String(hospital_id).padStart(2, '0') + date;
                    } else {
                        if (success.data[0] && success.data[0].count_id) {
                            let id_count = success.data[0].count_id;
                            if (String(id_count).length >= 10) {
                                checkDate = id_count.slice(-6);
                                if (checkDate == date) {
                                    let number = parseInt((id_count.slice(0, id_count.length - 8)));
                                    number += 1;
                                    id = String(number).padStart(3, '0') + String(hospital_id).padStart(2, '0') + date;
                                } else {
                                    id = '001' + String(hospital_id).padStart(2, '0') + date;
                                }
                            } else {
                                id = '001' + String(hospital_id).padStart(2, '0') + date;
                            }
                        } else {
                            id = '001' + String(hospital_id).padStart(2, '0') + date;
                        }
                    }
                    resolve({success: true, id_count : id});
                }else{
                    resolve({success: false, message : success.message});
                }
            });
        });
    },
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
    getMonthFromInt: function(value) {
        switch (value) {
            case 1:
                return "Jan";
            case 2:
                return "Feb";
            case 3:
                return "Mar";
            case 4:
                return "Apr";
            case 5:
                return "May";
            case 6:
                return "Jun";
            case 7:
                return "Jul";
            case 8:
                return "Aug";
            case 9:
                return "Sept";
            case 10:
                return "Oct";
            case 11:
                return "Nov";
            case 12:
                return "Dec";
            default:
                return "N/A";
        }
    },
    createPositionDateText: function(startDate, endDate, isCurrent) {
        const startDateText = webService.getMonthFromInt(startDate.month) + ". " + startDate.year;
        const endDateText = isCurrent ? "Present" : `${webService.getMonthFromInt(endDate.month)}. ${endDate.year}`;

        return `${startDateText} - ${endDateText}`;
    },
    createHeading: function(text) {
        return new Paragraph({
            text: text,
            heading: HeadingLevel.HEADING_1,
            thematicBreak: true,
        });
    },
    createSubHeading: function(text) {
        return new Paragraph({
            text: text,
            heading: HeadingLevel.HEADING_2,
        });
    },
    createInstitutionHeader: function(institutionName, dateText) {
        return new Paragraph({
            tabStops: [
                {
                    type: TabStopType.RIGHT,
                    position: TabStopPosition.MAX,
                },
            ],
            children: [
                new TextRun({
                    text: institutionName,
                    bold: true,
                }),
                new TextRun({
                    text: `\t${dateText}`,
                    bold: true,
                }),
            ],
        });
    },
    createRoleText: function(roleText) {
        return new Paragraph({
            children: [
                new TextRun({
                    text: roleText,
                    italics: true,
                }),
            ],
        });
    },
    splitParagraphIntoBullets: function(text) {
        return text.split("\n\n");
    },
    createInterests: function(interests) {
        return new Paragraph({
            children: [new TextRun(interests)],
        });
    },
    createAchivementsList: function(achivements) {
        return achivements.map(
            (achievement) =>
                new Paragraph({
                    text: achievement.name,
                    bullet: {
                        level: 0,
                    },
                }),
        );
    },
    createSkillList: function(skills) {
        return new Paragraph({
            children: [new TextRun(skills.map((skill) => skill.name).join(", ") + ".")],
        });
    },
    createBullet: function(text) {
        return new Paragraph({
            text: text,
            bullet: {
                level: 0,
            },
        });
    },
    createContactInfo: function(phoneNumber, profileUrl, email) {
        return new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
                new TextRun(`Mobile: ${phoneNumber} | LinkedIn: ${profileUrl} | Email: ${email}`),
                new TextRun({
                    text: "Address: 58 Elm Avenue, Kent ME4 6ER, UK",
                    break: 1,
                }),
            ],
        });
    }
}

module.exports = webService;