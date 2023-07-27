var request         = require('request'),
    db              = require('./../../config/db'),
    moment          = require('moment'),
    webService      = require('../models/webModel'),
    idCountExamine  = 1,
    dateCountExamine = '';

let examineService = {
    countAllExamine: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            if (err) return callback(err);
            var paraSQL = [];
            var search  = parameter.search;
            var sql     = `SELECT COUNT(*) AS count, hospital.id AS hospital_id FROM examine
                            LEFT JOIN department ON examine.department_id = department.id
                            LEFT JOIN hospital ON examine.hospital_id = hospital.id WHERE examine.active = 1`;
            
            if(parameter.filter){
                if (search.keyword !== "") {
                    sql += ` AND (examine.cus_name like ? OR examine.cus_phone like ? OR examine.count_id = ?)`;
                    paraSQL.push("%" + search.keyword + "%");
                    paraSQL.push("%" + search.keyword + "%");
                    paraSQL.push(search.keyword);
                }
                if (search.status_ids !== '') {
                    sql += " AND examine.status in (?)";
                    paraSQL.push(search.status_ids.split(','));
                }
                if(search.hospital_ids !== ''){
                    sql += " AND examine.hospital_id in (?)";
                    paraSQL.push(search.hospital_ids.split(','));
                }
                if (search.fromdate !== "" && search.todate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-"));
                    paraSQL.push(search.todate.split("-").reverse().join("-"));
                } else if (search.fromdate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 00:00:00");
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 23:59:59");
                }
            }
            //Không phải Administrator thì load các bản ghi theo khoa viện
            if(search.role_ids && search.role_ids.length == 0){
                if (search.name !== "" && search.phone !== "") {
                    sql += ` AND (examine.cus_name like ? AND examine.cus_phone like ?)`;
                    paraSQL.push("%" + search.name + "%");
                    paraSQL.push("%" + search.phone + "%");
                }
            }else{
                if (!search.role_ids.includes(1) && !search.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(search.role_ids.includes(5)){
                        sql += " AND examine.hospital_id = ?";
                        paraSQL.push(search.hospital_id);
                    }else if(search.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND examine.created_by = ?";
                        paraSQL.push(search.created_by);
                    }else{
                        //Nếu là bệnh nhân load theo số điện thoại hoặc email
                        sql += " AND (examine.cus_phone = ? OR examine.cus_email = ?)";
                        paraSQL.push(search.user_phone);
                        paraSQL.push(search.user_mail);
                    }
                }
            }
            
            var query = connection.query(sql, paraSQL, function(err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    },
    countAllExamine2: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            if (err) return callback(err);
            var paraSQL = [];
            var search  = parameter.search;
            var sql     = `SELECT COUNT(*) AS count, hospital.id AS hospital_id FROM examine
                            LEFT JOIN department ON examine.department_id = department.id
                            LEFT JOIN hospital ON examine.hospital_id = hospital.id WHERE examine.active = 1`;
            
            if(parameter.filter){
                if (search.name !== "" && search.phone !== "") {
                    sql += ` AND (examine.cus_name like ? AND examine.cus_phone like ?)`;
                    paraSQL.push("%" + search.name + "%");
                    paraSQL.push("%" + search.phone + "%");
                }
                if (search.fromdate !== "" && search.todate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-"));
                    paraSQL.push(search.todate.split("-").reverse().join("-"));
                } else if (search.fromdate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 00:00:00");
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 23:59:59");
                }
            }     
            var query = connection.query(sql, paraSQL, function(err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    },
    getAllExamine: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            if (err) return callback(err);
            var paraSQL     = [];
            var search      = parameter.search;
            var order_by    = "examine.created_at DESC";
            var sql         = `SELECT examine.*, hospital.id AS hospital_id, hospital.name AS hospital_name FROM examine
                                LEFT JOIN department ON examine.department_id = department.id
                                LEFT JOIN hospital ON examine.hospital_id = hospital.id WHERE examine.active = 1`;

            if (search.order_by == 0) {
                
            } else if (search.order_by == 1) {

            } else {

            }
            
            if(parameter.filter){
                if (search.keyword !== "") {
                    sql += ` AND (examine.cus_name like ? OR examine.cus_phone like ? OR examine.count_id = ?)`;
                    paraSQL.push("%" + search.keyword + "%");
                    paraSQL.push("%" + search.keyword + "%");
                    paraSQL.push(search.keyword);
                }
                if (search.status_ids !== '') {
                    sql += " AND examine.status in (?)";
                    paraSQL.push(search.status_ids.split(','));
                }
                if(search.hospital_ids !== ''){
                    sql += " AND examine.hospital_id in (?)";
                    paraSQL.push(search.hospital_ids.split(','));
                }
                if (search.fromdate !== "" && search.todate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-"));
                    paraSQL.push(search.todate.split("-").reverse().join("-"));
                } else if (search.fromdate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 00:00:00");
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 23:59:59");
                }
            }

            if(search.role_ids && search.role_ids.length == 0){
                if (search.name !== "" && search.phone !== "") {
                    sql += ` AND (examine.cus_name like ? AND examine.cus_phone like ?)`;
                    paraSQL.push("%" + search.name + "%");
                    paraSQL.push("%" + search.phone + "%");
                }
            }else{
                //Không phải Administrator thì load các bản ghi theo khoa viện
                if (!search.role_ids.includes(1) && !search.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(search.role_ids.includes(5)){
                        sql += " AND examine.hospital_id = ?";
                        paraSQL.push(search.hospital_id);
                    }else if(search.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND examine.created_by = ?";
                        paraSQL.push(search.created_by);
                    }else{
                        //Nếu là bệnh nhân load theo số điện thoại hoặc email
                        sql += " AND (examine.cus_phone = ? OR examine.cus_email = ?)";
                        paraSQL.push(search.user_phone);
                        paraSQL.push(search.user_mail);
                    }
                }
            }
            
            sql += " ORDER BY "+ order_by +" LIMIT ?,?";
            paraSQL.push(search.skip);
            paraSQL.push(search.take);
            
            var query = connection.query(sql, paraSQL, function(err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    },
    getAllExamine2: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            if (err) return callback(err);
            var paraSQL     = [];
            var search      = parameter.search;
            var order_by    = "examine.created_at DESC";
            var sql         = `SELECT examine.*, hospital.id AS hospital_id FROM examine
                                LEFT JOIN department ON examine.department_id = department.id
                                LEFT JOIN hospital ON examine.hospital_id = hospital.id WHERE examine.active = 1`;
            
            if(parameter.filter){
                if (search.name !== "" && search.phone !== "") {
                    sql += ` AND (examine.cus_name like ? AND examine.cus_phone like ?)`;
                    paraSQL.push("%" + search.name + "%");
                    paraSQL.push("%" + search.phone + "%");
                }
                if (search.fromdate !== "" && search.todate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-"));
                    paraSQL.push(search.todate.split("-").reverse().join("-"));
                } else if (search.fromdate !== "") {
                    sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 00:00:00");
                    paraSQL.push(search.fromdate.split("-").reverse().join("-") + " 23:59:59");
                }
            }
            
            sql += " ORDER BY "+ order_by +" LIMIT ?,?";
            paraSQL.push(search.skip);
            paraSQL.push(search.take);
            
            var query = connection.query(sql, paraSQL, function(err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    },
    getExamineGroupByDate: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            if (err) return callback(err);
            var paraSQL  = [];
            var sql      = `SELECT reportdate, count(*) as total FROM examine
                            WHERE examine.active = 1 `;

            if (parameter.hospital_ids !== "") {
                sql += " AND examine.hospital_id in (?)";
                paraSQL.push(parameter.hospital_ids);
            }
            if (parameter.status_ids !== '') {
                sql += " AND examine.status in (?)";
                paraSQL.push(parameter.status_ids);
            }
            if (parameter.fromdate_statistic !== "" && parameter.todate_statistic !== "") {
                sql += " AND examine.created_at >= ? AND examine.created_at <= ?";
                paraSQL.push(parameter.fromdate_statistic.split("-").reverse().join("-"));
                paraSQL.push(parameter.todate_statistic.split("-").reverse().join("-"));
            } else if (parameter.fromdate_statistic !== "") {
                sql += " AND pr_article.examine >= ? AND pr_article.examine <= ?";
                paraSQL.push(parameter.fromdate_statistic.split("-").reverse().join("-") + " 00:00:00");
                paraSQL.push(parameter.fromdate_statistic.split("-").reverse().join("-") + " 23:59:59");
            }
            //Không phải Administrator thì load các bản ghi theo khoa viện
            if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                //Nếu là quản lý load theo viện
                if(parameter.role_ids.includes(5)){
                    sql += " AND examine.hospital_id = ?";
                    paraSQL.push(parameter.hospital_id);
                }else if(parameter.role_ids.includes(4)){
                    //Nếu là bác sĩ load theo khoa
                    sql += " AND examine.created_by = ?";
                    paraSQL.push(parameter.created_by);
                }else{
                    //Nếu là bệnh nhân load theo số điện thoại hoặc email
                    sql += " AND (examine.cus_phone = ? OR examine.cus_email = ?)";
                    paraSQL.push(parameter.user_phone);
                    paraSQL.push(parameter.user_mail);
                }
            }
            sql += " GROUP BY examine.reportdate ORDER BY examine.reportdate";
            var query = connection.query(sql, paraSQL, function(err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    },
    getDetailExamineById: function(id) {
        return new Promise((resolve, reject) => {
            db.get().getConnection(function(err, connection) {
                if (err) {
                    resolve({
                        success: false,
                        message: err
                    });
                }
                var sql = `SELECT examine.*, hospital.id AS hospital_id, department.id AS department_id FROM examine INNER JOIN department ON department.id = examine.department_id INNER JOIN hospital ON hospital.id = department.hospital_id WHERE examine.id = ? ORDER BY examine.id DESC LIMIT 1`;

                connection.query(sql, [id], function(error, results, fields) {
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
            });
        });
    },
    getAllArticleStatus: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            if (err) return callback(err);
            var paraSQL = [];
            var sql     = `SELECT status FROM examine WHERE active = 1 `;

            if(parameter.role_ids && parameter.role_ids.length == 0){
                if (parameter.name !== "" && parameter.phone !== "") {
                    sql += ` AND (examine.cus_name like ? AND examine.cus_phone like ?)`;
                    paraSQL.push("%" + parameter.name + "%");
                    paraSQL.push("%" + parameter.phone + "%");
                }
            }else{
                //Không phải Administrator thì load các bản ghi theo khoa viện
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(parameter.role_ids.includes(5)){
                        sql += " AND examine.hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }else if(parameter.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND examine.created_by = ?";
                        paraSQL.push(parameter.created_by);
                    }else{
                        //Nếu là bệnh nhân load theo số điện thoại hoặc email
                        sql += " AND (examine.cus_phone = ? OR examine.cus_email = ?)";
                        paraSQL.push(parameter.user_phone);
                        paraSQL.push(parameter.user_mail);
                    }
                }
            }
            var query = connection.query(sql, paraSQL, function(err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    },
    getIdCountExamine: function(){
        return {id: idCountExamine, strDate: dateCountExamine}
    },
    setIdCountExamine: function(id, strDate){
        idCountExamine = id;
        dateCountExamine = strDate;
    },
    getIdCount: async function(prefix){
        try {
            let id = 1;
            let date = moment().format('MMYY');
            //lấy id
            let countExamine = examineService.getIdCountExamine();
            // nếu ngày trùng tháng năm hiện tại thì lấy id
            if(countExamine.strDate == date){
                id += countExamine.id;
            }else{
                // nếu không trùng tháng năm hiện tại thì lấy trong db
                let sqlIdCount = 'SELECT count_id FROM examine ORDER BY id DESC LIMIT 1';
                let data_id_examine = await webService.getListTable(sqlIdCount, []);
                if(data_id_examine.success && data_id_examine.data && data_id_examine.data.length > 0){
                    let id_examine = data_id_examine.data[0].count_id ? data_id_examine.data[0].count_id : '';
                    if (id_examine) {
                        //Check id cũ
                        let pattern = /[a-z|A-Z]/g;
                        if(pattern.test(id_examine)){
                            //Nếu có chứa ký tự
                            let numberInId = id_examine.replace(/[^0-9]/g, '');
                            let checkDate = numberInId.slice(-4);
                            if (checkDate == date) {
                                id = parseInt(numberInId.slice(0, numberInId.length - 4));
                                id += 1;
                            }
                        }
                    }
                }
            }
            //Set lại id count
            examineService.setIdCountExamine(id, date);
            return (String(id).padStart(3, '0') + date + prefix);
        } catch (error) {
            console.log('getIdCount', error);
        }
    }
}

module.exports = examineService