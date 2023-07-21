var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let indexByAgeService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO index_by_age(age,gender,height_min,height_max,weight_min,weight_max,bmi_min,bmi_max,created_at) VALUES (?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)";
                var query = connection.query(sql, [
                    parameter.age,
                    parameter.gender,
                    parameter.height_min,
                    parameter.height_max,
                    parameter.weight_min,
                    parameter.weight_max,
                    parameter.bmi_min,
                    parameter.bmi_max,
                ], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'IndexByAgeModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE index_by_age SET age = ?, gender = ?, height_min = ?, height_max = ?, weight_min = ?, weight_max = ?, bmi_min = ?, bmi_max = ? WHERE id=?';
                var query = connection.query(sql, [
                    parameter.age,
                    parameter.gender,
                    parameter.height_min,
                    parameter.height_max,
                    parameter.weight_min,
                    parameter.weight_max,
                    parameter.bmi_min,
                    parameter.bmi_max,
                    parameter.id
                ], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'IndexByAgeModel update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM index_by_age WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'IndexByAgeModel delete');
                return callback(error);
            }
        });
    },
    countAllIndexByAge: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM index_by_age WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND age = ?";
                    paraSQL.push(parameter.search_name);
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'IndexByAgeModel countAllIndexByAge');
                return callback(error);
            }
        });
    },
    getAllIndexByAge: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM index_by_age WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND age = ?";
                    paraSQL.push(parameter.search_name);
                }
                
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'IndexByAgeModel getAllIndexByAge');
                return callback(error);
            }
        });
    },
    getIndexByAgeById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM index_by_age WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'IndexByAgeModel getIndexByAgeById');
                return callback(error);
            }
        });
    }
}

module.exports = indexByAgeService;