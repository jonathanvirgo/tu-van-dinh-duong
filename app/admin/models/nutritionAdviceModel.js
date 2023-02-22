var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let nutritionAdviceService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO nutrition_advice (name,hospital_id,phone) VALUES (?,?,?)";
                var query = connection.query(sql, [parameter.name,parameter.hospital_id,parameter.phone], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService create');
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE nutrition_advice SET name = ?, hospital_id = ?, phone = ? WHERE id=?';
                var query = connection.query(sql, [parameter.name,parameter.hospital_id,parameter.phone, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService update');
            }
        });
    },
    delete: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM nutrition_advice WHERE id=?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService delete');
            }
        });
    },
    countAllNutritionAdvice: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM nutrition_advice WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService countAllNutritionAdvice');
            }
        });
    },
    getAllNutritionAdvice: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM nutrition_advice WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService getAllNutritionAdvice');
            }
        });
    },
    getNutritionAdviceById: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM nutrition_advice WHERE id = ?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService getNutritionAdviceById');
            }
        });
    }
}

module.exports = nutritionAdviceService;