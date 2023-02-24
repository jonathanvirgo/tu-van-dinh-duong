var request         = require('request'),
    db              = require('./../../config/db'),
    moment          = require('moment'),
    webService      = require('../models/webModel');

let examineService = {
    countAllExamine: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            if (err) return callback(err);
            var paraSQL = [];
            var search  = parameter.search;
            var sql     = `SELECT COUNT(*) AS count, hospital.id AS hospital_id FROM examine
                            INNER JOIN department ON examine.department_id = department.id
                            INNER JOIN hospital ON department.hospital_id = hospital.id`;
            
            if(parameter.filter){
                if (search.keyword !== "") {
                    sql += ` AND (examine.cus_name like ? OR examine.cus_phone like ?)`;
                    paraSQL.push("%" + search.keyword + "%");
                    paraSQL.push("%" + search.keyword + "%");
                }
                if (search.status_ids !== '') {
                    sql += " AND examine.status in (" + search.status_ids + ")";
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
            if (!search.role_ids.includes(1) && !search.role_ids.includes(3)){
                //Nếu là quản lý load theo viện
                if(search.role_ids.includes(5)){
                    sql += " AND examine.hospital_id = ?";
                    paraSQL.push(search.hospital_id);
                }else if(search.role_ids.includes(4)){
                    //Nếu là bác sĩ load theo khoa
                    sql += " AND examine.department_id = ?";
                    paraSQL.push(search.department_id);
                }else{
                    //Nếu là bệnh nhân load theo số điện thoại hoặc email
                    sql += " AND (examine.cus_phone = ? OR examine.cus_email = ?)";
                    paraSQL.push(search.user_phone);
                    paraSQL.push(search.user_mail);
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
            var sql         = `SELECT examine.*, hospital.id AS hospital_id FROM examine
                                INNER JOIN department ON examine.department_id = department.id
                                INNER JOIN hospital ON department.hospital_id = hospital.id`;
            if (search.order_by == 0) {
                
            } else if (search.order_by == 1) {

            } else {

            }
            
            if(parameter.filter){
                if (search.keyword !== "") {
                    sql += ` AND (examine.cus_name like ? OR examine.cus_phone like ?)`;
                    paraSQL.push("%" + search.keyword + "%");
                    paraSQL.push("%" + search.keyword + "%");
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
            if (!search.role_ids.includes(1) && !search.role_ids.includes(3)){
                //Nếu là quản lý load theo viện
                if(search.role_ids.includes(5)){
                    sql += " AND examine.hospital_id = ?";
                    paraSQL.push(search.hospital_id);
                }else if(search.role_ids.includes(4)){
                    //Nếu là bác sĩ load theo khoa
                    sql += " AND examine.department_id = ?";
                    paraSQL.push(search.department_id);
                }else{
                    //Nếu là bệnh nhân load theo số điện thoại hoặc email
                    sql += " AND (examine.cus_phone = ? OR examine.cus_email = ?)";
                    paraSQL.push(search.user_phone);
                    paraSQL.push(search.user_mail);
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
            var sql      = `SELECT reportdate, count(*) as total FROM pr_article 
                            INNER JOIN pr_booking ON pr_article.booking_id = pr_booking.id 
                            WHERE pr_article.active = 1 AND pr_article.type IS NOT NULL`;

            if (parameter.site_ids !== "") {
                sql += " AND pr_booking.site_id in (?)";
                paraSQL.push(parameter.site_ids);
            }
            if (parameter.status_ids !== '') {
                sql += " AND pr_article.search_status in (?)";
                paraSQL.push(parameter.status_ids);
            }
            if (parameter.fromdate !== "" && parameter.todate !== "") {
                sql += " AND pr_article.created_at >= ? AND pr_article.created_at <= ?";
                paraSQL.push(parameter.fromdate.split("-").reverse().join("-"));
                paraSQL.push(parameter.todate.split("-").reverse().join("-"));
            } else if (parameter.fromdate !== "") {
                sql += " AND pr_article.created_at >= ? AND pr_article.created_at <= ?";
                paraSQL.push(parameter.fromdate.split("-").reverse().join("-") + " 00:00:00");
                paraSQL.push(parameter.fromdate.split("-").reverse().join("-") + " 23:59:59");
            }
            if (!parameter.role_ids.includes(1)) {
                //Không phải Administrator thì load các bản ghi do người đó tạo ra
                sql += " AND pr_booking.created_by = ?";
                paraSQL.push(parameter.created_by);
            }
            sql += " GROUP BY pr_article.reportdate ORDER BY pr_article.reportdate";
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
    }
}

module.exports = examineService