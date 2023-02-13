var db = require('./../../config/db');

module.exports.create = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = "INSERT INTO role_user(role_id,user_id) VALUES (?,?)";
        var query = connection.query(sql,
            [
                parameter.role_id,
                parameter.user_id
            ],
        function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.delete = function (user_id, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'DELETE FROM role_user where user_id=?';
        var query = connection.query(sql, [user_id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.getRoleByUserId = function (user_id, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT role_id FROM role_user WHERE user_id=?';
        var query = connection.query(sql, [user_id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

