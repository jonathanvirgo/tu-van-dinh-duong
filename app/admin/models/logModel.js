let db           = require('../../config/db'),
    adminService = require('./adminModel'),
    webService  = require('../../web/models/webModel');

let logService = {
    create: function (req, message = '') {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function (err, connection) {
                try {
                    if (err) {
                        return resolve(0);
                    }
                    var user_id = 0;
                    if (req.user) {
                        user_id = req.user.id;
                    }
                    var short_message = message.sqlMessage != undefined ? message.sqlMessage : message;
                    var full_message  = message.sql != undefined ? message.sql : '';
                    var sql           = "INSERT INTO log_err(user_id,short_message,full_message,page_url,referrer_url) VALUES (?,?,?,?,?)";
                    var queryString   =  connection.query(sql, [
                            user_id,
                            short_message ? short_message : '',
                            full_message,
                            req.originalUrl,
                            req.headers.referer
                        ], 
                        function (error, results, fields) {
                        connection.release();
                        if (error) {
                            return resolve(0);
                        }
                        resolve(results.insertId);
                    });
                } catch (error) {
                    webService.addToLogService(error, 'logModel create');
                }
            });
        })
    },
    createFromParams: function (message, page_url) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function (err, connection) {
                try {
                    
                    if (err) {
                        return resolve(0);
                    }
                    let short_message = typeof(message) == 'string' ? message : (message.sqlMessage != undefined ? message.sqlMessage : '');
                    let full_message  = (message && message.sql != undefined) ? message.sql : '';
                    let sql           = "INSERT INTO log_err(short_message,full_message,page_url) VALUES (?,?,?)";
                    connection.query(sql, [
                            short_message,
                            full_message,
                            page_url
                        ], 
                        function (error, results, fields) {
                        connection.release();
                        if (error) {
                            resolve(0);
                        }
                        resolve(results.insertId);
                    });
                } catch (error) {
                    webService.addToLogService(error, 'logModel createFromParams');
                }
            });
        })
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM log_err WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                }); 
            } catch (error) {
                webService.addToLogService(error, 'logModel delete');
            }
        });
    },
    deleteByIds: function (ids, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM log_err WHERE id in('+ ids +')';
                var query = connection.query(sql, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'logModel deleteByIds');
            }
        });
    },
    deleteAll: function (callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM log_err';
                var query = connection.query(sql, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'logModel deleteAll');
            }
        });
    },
    countAllLog: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM log_err WHERE id > 0';
                if (parameter.message != "") {
                    sql += " AND (short_message LIKE ? || full_message LIKE ?)";
                    paraSQL.push("%" + parameter.message + "%");
                    paraSQL.push("%" + parameter.message + "%");
                }
                if (parameter.created_on_from != "") {
                    sql += " AND create_on >= ?";
                    paraSQL.push(adminService.parseDay(parameter.created_on_from));
                }
                if (parameter.created_on_to != "") {
                    sql += " AND create_on <= ?";
                    paraSQL.push(adminService.parseDay(parameter.created_on_to));
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'logModel countAllLog');
            }
        });
    },
    getAllLog: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT log_err.id,log_err.short_message,log_err.create_on,user.full_name as user_name FROM log_err INNER JOIN user ON log_err.user_id = user.id WHERE log_err.id > 0';
                
                if (parameter.message != "") {
                    sql += " AND (short_message LIKE ? or full_message LIKE ?)";
                    paraSQL.push("%" + parameter.message + "%");
                    paraSQL.push("%" + parameter.message + "%");
                }
                if (parameter.created_on_from != "") {
                    sql += " AND create_on >= ?";
                    paraSQL.push(adminService.parseDay(parameter.created_on_from));
                }
                if (parameter.created_on_to != "") {
                    sql += " AND create_on <= ?";
                    paraSQL.push(adminService.parseDay(parameter.created_on_to));
                }
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'logModel getAllLog');
            }
        });
    },
    getLogById: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT log_err.*,user.full_name as log_user_name FROM log_err INNER JOIN user ON log_err.user_id = user.id WHERE log_err.id = ?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'logModel getLogById');
            }
        });
    }
}   
module.exports = logService;
