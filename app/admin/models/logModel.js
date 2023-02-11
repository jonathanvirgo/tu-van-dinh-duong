var db           = require('../../config/db'),
    adminService = require('./adminModel'),
    url          = require('url');

module.exports.create = function (req, message = '') {
    return new Promise(function(resolve, reject) {
        db.get().getConnection(function (err, connection) {
            if (err) {
                return resolve(0);
            }
            var user_id = 0;
            if (req.user) {
                user_id = req.user.id;
            }
            var short_message = message.sqlMessage != undefined ? message.sqlMessage : message;
            var full_message  = message.sql != undefined ? message.sql : '';
            var sql           = "INSERT INTO pr_log(user_id,short_message,full_message,page_url,referrer_url) VALUES (?,?,?,?,?)";
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
        });
    })
}

module.exports.createFromParams = function (message, page_url) {
    return new Promise(function(resolve, reject) {
        db.get().getConnection(function (err, connection) {
            if (err) {
                return resolve(0);
            }
            let short_message = message ? (message.sqlMessage != undefined ? message.sqlMessage : message) : '';
            let full_message  = message.sql != undefined ? message.sql : '';
            let sql           = "INSERT INTO pr_log(short_message,full_message,page_url) VALUES (?,?,?)";
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
        });
    })
}

module.exports.delete = function (id, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'DELETE FROM pr_log WHERE id=?';
        var query = connection.query(sql, [id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.deleteByIds = function (ids, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'DELETE FROM pr_log WHERE id in('+ ids +')';
        var query = connection.query(sql, function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.deleteAll = function (callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'DELETE FROM pr_log';
        var query = connection.query(sql, function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.countAllLog = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var paraSQL = [];
        var sql     = 'SELECT COUNT(*) AS count FROM pr_log WHERE id > 0';
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
    });
}

module.exports.getAllLog = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var paraSQL = [];
        var sql     = 'SELECT pr_log.id,pr_log.short_message,pr_log.create_on,pr_user.full_name as user_name FROM pr_log INNER JOIN pr_user ON pr_log.user_id = pr_user.id WHERE pr_log.id > 0';
        
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
    });
}

module.exports.getLogById = function (id, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT pr_log.*,pr_user.full_name as log_user_name FROM pr_log INNER JOIN pr_user ON pr_log.user_id = pr_user.id WHERE pr_log.id = ?';
        var query = connection.query(sql, [id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}
