var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let heightByWeightService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO height_by_weight(height,gender,weight_min,weight_max,created_at) VALUES (?,?,?,?,CURRENT_TIMESTAMP)";
                var query = connection.query(sql, [parameter.height,parameter.gender,parameter.weight_min,parameter.weight_max], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'HeightByWeightModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE height_by_weight SET height = ?, gender = ?, weight_min = ?, weight_max = ? WHERE id=?';
                var query = connection.query(sql, [parameter.height,parameter.gender,parameter.weight_min,parameter.weight_max,parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'HeightByWeightModel update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM height_by_weight WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'HeightByWeightModel delete');
                return callback(error);
            }
        });
    },
    countAllHeightByWeight: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM height_by_weight WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND height = ?";
                    paraSQL.push(parameter.search_name);
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'HeightByWeightModel countAllHeightByWeight');
                return callback(error);
            }
        });
    },
    getAllHeightByWeight: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM height_by_weight WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND height = ?";
                    paraSQL.push(parameter.search_name);
                }
                
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'HeightByWeightModel getAllHeightByWeight');
                return callback(error);
            }
        });
    },
    getHeightByWeightById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM height_by_weight WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'HeightByWeightModel getHeightByWeightById');
                return callback(error);
            }
        });
    }
}

module.exports = heightByWeightService;