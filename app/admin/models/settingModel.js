var db = require('./../../config/db');

module.exports.create = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = "INSERT INTO pr_setting(systemname,body) VALUES (?,?)";
        var query = connection.query(sql, [parameter.systemname, parameter.body], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.update = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'UPDATE pr_setting SET systemname = ?, body = ? WHERE id=?';
        var query = connection.query(sql, [parameter.systemname, parameter.body, parameter.id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.delete = function (id, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'DELETE FROM pr_setting WHERE id=?';
        var query = connection.query(sql, [id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.countAllSetting = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var paraSQL = [];
        var sql     = 'SELECT COUNT(*) AS count FROM pr_setting WHERE id > 0';
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
    });
}

module.exports.getAllSetting = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var paraSQL = [];
        var sql     = 'SELECT * FROM pr_setting WHERE id > 0';
        
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
    });
}

module.exports.getSettingById = function (id, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT * FROM pr_setting WHERE id=?';
        var query = connection.query(sql, [id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.getSettingBySystemName = function (systemname, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT body FROM pr_setting WHERE systemname=?';
        var query = connection.query(sql, [systemname], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}
