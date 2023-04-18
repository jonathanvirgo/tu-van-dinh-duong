let db           = require('../../config/db'),
    adminService = require('./adminModel');

let logService = {
    create: function (req, message = '') {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function (err, connection) {
                try {
                    if (err) {
                        return resolve({success:false});
                    }
                    var user_id = 0;
                    if (req.user) {
                        user_id = req.user.id;
                    }
                    var short_message = '';
                    var full_message  = '';
                    if (typeof message === "string") {
                        full_message = message;
                    } else if (message instanceof Error) {
                        full_message = JSON.stringify(message);
                        short_message = message.message ? message.message : '';
                    }else{
                        full_message = JSON.stringify(message);
                        short_message = message.sql ? message.sql : '';
                    }
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
                            return resolve({success:false});
                        }
                        resolve({insertId: results.insertId, message: short_message, success:true});
                    });
                } catch (error) {
                    let message_err = error.message ? error.message : error;
                    logService.createFromParams(message_err, 'logModel create');
                }
            });
        })
    },
    createFromParams: function (message, page_url) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function (err, connection) {
                try {
                    if (err) {
                        return resolve(err);
                    }
                    var short_message = '';
                    var full_message  = '';
                    if (typeof message === "string") {
                        full_message = message;
                    } else if (message instanceof Error) {
                        full_message = JSON.stringify(message);
                        short_message = message.message ? message.message : '';
                    }else{
                        full_message = JSON.stringify(message);
                        short_message = message.sql ? message.sql : '';
                    }
                    let sql           = "INSERT INTO log_err(short_message,full_message,page_url) VALUES (?,?,?)";
                    var query = connection.query(sql, [
                            short_message,
                            full_message,
                            page_url
                        ], 
                        function (error, results, fields) {
                        connection.release();
                        if (error) {
                            resolve(error);
                        }
                        resolve(results.insertId);
                    });
                } catch (error) {
                    resolve(error);
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
                let message_err = error.message ? error.message : error;
                logService.createFromParams(message_err, 'logModel delete');
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
                let message_err = error.message ? error.message : error;
                logService.createFromParams(message_err, 'logModel deleteByIds');
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
                let message_err = error.message ? error.message : error;
                logService.createFromParams(message_err, 'logModel deleteAll');
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
                let message_err = error.message ? error.message : error;
                logService.createFromParams(message_err, 'logModel countAllLog');
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
                let message_err = error.message ? error.message : error;
                logService.createFromParams(message_err, 'logModel getAllLog');
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
                let message_err = error.message ? error.message : error;
                logService.createFromParams(message_err, 'logModel getLogById');
            }
        });
    },
    authorizeAccess: function(role_id, type){
        try {
            if(role_id && role_id.length > 0){
                if(role_id.includes(1) || role_id.includes(3)) return true;
                if(role_id.includes(5)){
                    if(['role', 'user', 'hospital', 'log', 'setting'].includes(type)){
                        return false;
                    }else{
                        return true;
                    }
                }
                if(role_id.includes(4)){
                    if(['role', 'user', 'hospital', 'log', 'setting','department','medical-test','medical-test-type'].includes(type)){
                        return false;
                    }else{
                        return true;
                    }
                }
                return false;
            }else{
                return false;
            }
        } catch (error) {
            let message_err = error.message ? error.message : error;
            logService.createFromParams(message_err, 'logModel authorizeAccess');
        }
    }
}   
module.exports = logService;
