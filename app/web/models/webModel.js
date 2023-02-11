var md5             = require('md5'),
    request         = require('request'),
    url             = require('url'),
    moment          = require('moment'),
    jwt             = require('jsonwebtoken'),
    db              = require('../../config/db'),
    logService      = require('../../admin/models/logModel'),

    jwtPrivateKey   = "4343636e4d354b45517159456534636d4e34344e4d4e50427371614575577451",
    domain          = "pr-ims.admicro.vn";

let webService = {
    prServicesUrl: function(version = 0) {
        var url = 'https://pr.admicro.vn/auth/PrNews';
        if (version !== 0) {
            url = 'https://pr.admicro.vn/auth/PrNews_V2';
        }
        return url;
    },
    prServicesKey: function() {
        return "bc4337d2214996821bf977b9e6f5bf4d";
    },
    dtServicesDomain: function() {
        return db.domain;
    },
    getDomainPRIMS: function() {
        var domain_ims = "https://pr-ims.admicro.vn";
        if(webService.dtServicesDomain() == "https://dev.dangtin.admicro.vn"){
            domain_ims = "https://dev.pr-ims.admicro.vn";
        }
        return domain_ims;
    },
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

        }
    },
    parseDay: function(time) {
        var date        = new Date(time);
        var month       = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
        var day         = (date.getDate()) < 10 ? '0' + (date.getDate()) : (date.getDate());
        var hours       = (date.getHours()) < 10 ? '0' + (date.getHours()) : (date.getHours());
        var minute      = (date.getMinutes) < 10 ? '0' + (date.getMinutes()) : (date.getMinutes());
        var dateformat  = day + '-' + month + '-' + date.getFullYear();
        return dateformat;
    },
    addDays: function(days) {
        var date = new Date();
        date.setDate(date.getDate() + days);
        return webService.parseDay(date);
    },
    addToLog: function(req, message) {
        let message_err = message.message ? message.message : message;
        return logService.create(req, message_err);
    },
    addToLogService: function(message, page_url) {
        let message_err = message.message ? message.message : message;
        return logService.createFromParams(message_err, page_url)
    },
    sortChannelForTree: function(channels, type = 0) {
        var map   = {},
            node,
            roots = [],
            list  = [],
            i;
        for (i = 0; i < channels.length; i++) {
            var row = {
                'id': channels[i].pr_channel_id,
                'parent_id': channels[i].parent_id,
                'name': channels[i].name,
                'children': []
            };
            if (type == 1) {
                row.status          = channels[i].status;
                row.pr_channel_id   = channels[i].pr_channel_id;
                row.domain          = channels[i].domain;
                row.site_id         = channels[i].site_id;
                row.updated_at      = channels[i].updated_at;
            }
            list.push(row);
            map[row.id] = i;
        }
        for (i = 0; i < list.length; i += 1) {
            node = list[i];
            if (node.parent_id !== 0 && typeof map[node.parent_id] !== "undefined") {
                list[map[node.parent_id]].children.push(node);
            } else {
                roots.push(node);
            }
        }
        return roots;
    },
    sortChannelForVirtualSelect: function(channels) {
        var list = [];
        if (channels && channels.length > 0) {
            for (i = 0; i < channels.length; i++) {
                list.push({
                    label: channels[i].name,
                    value: channels[i].id
                });
                for (j = 0; j < channels[i].children.length; j++) {
                    list.push({
                        label: channels[i].name + " - " + channels[i].children[j].name,
                        value: channels[i].children[j].id
                    });
                }
            }
        }
        return list;
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

        }
    },
    createHeaderToken: function() {
        var data = {
            domain: domain,
            ctt: new Date()
        };
        return jwt.sign(data, jwtPrivateKey, {
            algorithm: 'HS512',
            expiresIn: 60 * 60
        });
    },
    loginFormToken: function(username, password) {
        var userData = {
            upass: md5(password),
            uname: username,
            ctt: new Date()
        };
        return jwt.sign(userData, jwtPrivateKey, {
            algorithm: 'HS256',
            expiresIn: 60 * 60
        });
    },
    readyToken: function(token) {
        try {
            return jwt.verify(token, jwtPrivateKey);
        } catch (err) {
            return ""
        }
    },
    createFormToken: function(parameter) {
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
    },
    createSideBarFilter: function(req, type = 1, perPage = 10) {
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
                    site_ids: query.site_ids == undefined ? "" : query.site_ids,
                    status_ids: query.status_ids == undefined ? "" : query.status_ids,
                    book_date: query.book_date == undefined ? "" : query.book_date,
                    order_by: query.order_by == undefined ? 1 : parseInt(query.order_by),
                    created_by: 0,
                    role_ids: []
                },
                requestUri: "",
                siteIds: [],
                statusIds: [],
                error: [],
            };

        if(req.user){
            listData.search.created_by = req.user.id;
            listData.search.role_ids   = req.user.role_id;
        }
        if (type == 0) {
        listData.requestUri = "/search?keyword=" + listData.search.keyword;
        } else if (type == 1) {
            listData.requestUri = "/booking?keyword=" + listData.search.keyword;
        } else if (type == 2) {
            listData.requestUri = "/article?keyword=" + listData.search.keyword;
        } else {
            listData.requestUri = "?keyword=" + listData.search.keyword;
        }

        if (listData.search.site_ids !== '') {
            var arr_site = listData.search.site_ids.split(",");
            for (var i = 0; i < arr_site.length; i++) {
                if(!isNaN(parseInt(arr_site[i]))){
                    listData.siteIds.push(parseInt(arr_site[i]));
                }
            }
            listData.requestUri += "&site_ids=" + listData.search.site_ids;
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
        if (listData.search.order_by !== '') {
            listData.requestUri += "&order_by=" + listData.search.order_by;
        }
        
        if (listData.search.book_date == '') {
            //dashboard set default 30 day
            if(type == 3){
                listData.search.fromdate = webService.addDays(-30);
                listData.search.todate   = webService.parseDay(new Date());
            }
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
        return new Promise(function(resolve, reject) {
            Promise.all(arrPromise).then(function() {
                resolve(listData);
            })
        })
    },
    addLogApi(param, result, link) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                if (err) reject(err);
                let sql = 'INSERT INTO pr_log_api(param,result,link) VALUES (?,?,?)';
                connection.query(sql, [param, result, link], function(error, results, fields) {
                    connection.release();
                    if (error) reject(error);
                    resolve(results);
                });
            });
        });
    },
    templateEmailNew: function(text_content, button) {
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
                                            src="https://adi.admicro.vn/adt/tvc/files/images/0123/admicro_1673342597.png"
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
                                    Email: <span style="color:#fff;"> <a href="mailto:contact@admicro.vn" style="color: #fff; text-decoration: none;"> contact@admicro.vn</a></span> </p>
                                    <p style="line-height: 16px; text-align: left; color:#A4B4CB;font-size:12px;font-family:'Nunito',Helvetica,Arial,sans-serif;margin-bottom: 10px;">
                                    Hotline: <span style="color:#fff;">
                                        <a href="tel:(024) 7307 7979 " style="color:#fff; text-decoration: none;">(024) 7307 7979</a>
                                    </span>
                                    </p>
                                    <p style="line-height: 16px; text-align: left; color:#A4B4CB;font-size:12px;font-family:'Nunito',Helvetica,Arial,sans-serif;margin-bottom: 10px;">
                                    Fax: <span style="color:#fff;"> (024) 7307 7980</span> </p>
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
                                    <p style="line-height: 16px; text-align: left;  color:#f5f5f5;font-size:14px;font-family:'Nunito Sans',Helvetica,Arial,sans-serif">
                                    <a href="#" style="text-decoration:none;color: #F2C144; font-weight:600;">
                                        <b>Xem báo giá Booking PR tại đây <span style="padding-left: 13px;"></span> <img
                                            src="https://adi.admicro.vn/adt/tvc/files/images/0123/arright_1673343608.png" alt="">
                                        </b>
                                    </a>
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
    },
    countObjectSize: function(obj) {
        let size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    }
}

module.exports = webService;