var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let nutritionalNeedsService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO nutritional_needs(age_min,age_max,gender,content,created_at) VALUES (?,?,?,?,CURRENT_TIMESTAMP)";
                var query = connection.query(sql, [parameter.age_min,parameter.age_max,parameter.gender,parameter.content], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionalNeedsModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE nutritional_needs SET age_min = ?, age_max = ?, gender = ?, content = ? WHERE id=?';
                var query = connection.query(sql, [parameter.age_min,parameter.age_max,parameter.gender,parameter.content,parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionalNeedsModel update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM nutritional_needs WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionalNeedsModel delete');
                return callback(error);
            }
        });
    },
    countAllnutritionalNeeds: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM nutritional_needs WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND content LIKE ?";
                    paraSQL.push('%' + parameter.search_name + '%');
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionalNeedsModel countAllnutritionalNeeds');
                return callback(error);
            }
        });
    },
    getAllnutritionalNeeds: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM nutritional_needs WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND content LIKE ?";
                    paraSQL.push('%' + parameter.search_name + '%');
                }
                
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionalNeedsModel getAllnutritionalNeeds');
                return callback(error);
            }
        });
    },
    getnutritionalNeedsById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM nutritional_needs WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionalNeedsModel getDiagnosticById');
                return callback(error);
            }
        });
    }
}

module.exports = nutritionalNeedsService;