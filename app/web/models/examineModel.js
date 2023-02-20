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
            var sql     = `SELECT COUNT(*) AS count FROM examine
                            INNER JOIN department ON examine.department_id = department.id
                            INNER JOIN hospital ON department.hospital_id = hospital.id`;
            
            if(parameter.filter){
                if (search.keyword !== "") {
                    sql += ` AND (examine.cus_name like ? OR examine.cus_phone like ?)`;
                    paraSQL.push("%" + search.keyword + "%");
                    paraSQL.push("%" + search.keyword + "%");
                }
                // if (search.site_ids !== "") {
                //     sql += " AND pr_booking.site_id in (?)";
                //     paraSQL.push(search.site_ids);
                // }
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

            // if (!search.role_ids.includes(1)) {
            //     //Không phải Administrator thì load các bản ghi do người đó tạo ra
            //     sql += " AND pr_booking.created_by = ?";
            //     paraSQL.push(search.created_by);
            // }
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
            var sql         = `SELECT examine.* FROM examine
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
                // if (search.site_ids !== "") {
                //     sql += " AND pr_booking.site_id in (?)";
                //     paraSQL.push(search.site_ids);
                // }
                // if (search.status_ids !== '') {
                //     sql += " AND pr_article.search_status in (" + search.status_ids + ")";
                // }
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
            
            // if (!search.role_ids.includes(1)) {
            //     //Không phải Administrator thì load các bản ghi do người đó tạo ra
            //     sql += " AND pr_booking.created_by = ?";
            //     paraSQL.push(search.created_by);
            // }
            sql += " ORDER BY "+ order_by +" LIMIT ?,?";
            paraSQL.push(search.skip);
            paraSQL.push(search.take);
            
            var query = connection.query(sql, paraSQL, function(err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    }
}

module.exports = examineService