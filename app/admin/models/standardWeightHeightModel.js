var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let standardWeightHeightService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO standard_weight_height(year_old,type_year_old,gender,weight,height,created_at) VALUES (?,?,?,?,?,CURRENT_TIMESTAMP)";
                var query = connection.query(sql, [parameter.year_old,parameter.type_year_old,parameter.gender,parameter.weight,parameter.height], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'standardWeightHeightModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE standard_weight_height SET year_old = ?, type_year_old = ?, gender = ?, weight = ?, height = ? WHERE id=?';
                var query = connection.query(sql, [parameter.year_old,parameter.type_year_old,parameter.gender,parameter.weight,parameter.height,parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'standardWeightHeightModel update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM standard_weight_height WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'standardWeightHeightModel delete');
                return callback(error);
            }
        });
    },
    countAllStandardWeightHeight: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM standard_weight_height WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND year_old = ?";
                    paraSQL.push(parameter.search_name);
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'standardWeightHeightModel countAllStandardWeightHeight');
                return callback(error);
            }
        });
    },
    getAllStandardWeightHeight: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM standard_weight_height WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND year_old = ?";
                    paraSQL.push(parameter.search_name);
                }
                
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'standardWeightHeightModel getAllStandardWeightHeight');
                return callback(error);
            }
        });
    },
    getStandardWeightHeightById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM standard_weight_height WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'standardWeightHeightModel getDiagnosticById');
                return callback(error);
            }
        });
    }
}

module.exports = standardWeightHeightService;