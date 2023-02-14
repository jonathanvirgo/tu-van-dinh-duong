var db      = require('./../../config/db'),
webService  = require('../../web/models/webModel');

let settingService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO setting(systemname,body) VALUES (?,?)";
                var query = connection.query(sql, [parameter.systemname, parameter.body], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'settingService create');
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE setting SET systemname = ?, body = ? WHERE id=?';
                var query = connection.query(sql, [parameter.systemname, parameter.body, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'settingService update');
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM setting WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'settingService delete');
            }
        });
    },
    countAllSetting: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM setting WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND systemname LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                if (parameter.search_value != "") {
                    sql += " AND body LIKE ?";
                    paraSQL.push("%" + parameter.search_value + "%");
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'settingService countAllSetting');
            }
        });
    },
    getAllSetting: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM setting WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND systemname LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                if (parameter.search_value != "") {
                    sql += " AND body LIKE ?";
                    paraSQL.push("%" + parameter.search_value + "%");
                }
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'settingService getAllSetting');
            }
        });
    },
    getSettingById: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM setting WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'settingService getSettingById');
            }
        });
    },
    getSettingBySystemName: function (systemname, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT body FROM setting WHERE systemname=?';
                var query = connection.query(sql, [systemname], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'settingService getSettingBySystemName');
            }
        });
    }
}

module.exports = settingService;
