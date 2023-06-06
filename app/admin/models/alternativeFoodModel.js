var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let alternativeFoodService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO alternative_food (name,food_main,food_replace,hospital_id,department_id,created_by) VALUES (?,?,?,?,?,?)";
                var query = connection.query(sql, [parameter.name,parameter.food_main,parameter.food_replace,parameter.hospital_id,parameter.department_id,parameter.created_by], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'alternativeFoodService create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE alternative_food SET name = ?, food_main = ?, food_replace = ?, hospital_id = ?, department_id = ?, created_by = ? WHERE id=?';
                var query = connection.query(sql, [parameter.name,parameter.food_main,parameter.food_replace, parameter.hospital_id, parameter.department_id, parameter.created_by, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'alternativeFoodService update');
                return callback(error);
            }
        });
    },
    delete: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM alternative_food WHERE id=?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'alternativeFoodService delete');
                return callback(error);
            }
        });
    },
    countAllAlternativeFood: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM alternative_food WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                //Không phải Administrator thì load các bản ghi theo khoa viện
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(parameter.role_ids.includes(5)){
                        sql += " AND hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }else if(parameter.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND (created_by = ?)";
                        paraSQL.push(parameter.created_by);
                    }
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'alternativeFoodService countAllAlternativeFood');
                return callback(error);
            }
        });
    },
    getAllAlternativeFood: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM alternative_food WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                //Không phải Administrator thì load các bản ghi theo khoa viện
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(parameter.role_ids.includes(5)){
                        sql += " AND hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }else if(parameter.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND (created_by = ?)";
                        paraSQL.push(parameter.created_by);
                    }
                }
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'alternativeFoodService getAllAlternativeFood');
                return callback(error);
            }
        });
    },
    getAlternativeFoodById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM alternative_food WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'alternativeFoodService getAlternativeFoodById');
                return callback(error);
            }
        });
    }
}

module.exports = alternativeFoodService;