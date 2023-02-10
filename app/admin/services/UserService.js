
let userService = {
    getUserById : function (id, callback) {
        db.get().getConnection(function (err, connection) {
            if (err) return callback(err);
            var sql   = 'SELECT * FROM pr_user WHERE id = ?';
            var query = connection.query(sql, [id], function (err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    },
    getUser : function(name, password) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM pr_user WHERE name = ? AND password = ?';
                var query = connection.query(sql, [name, password], function (err, results, fields) {
                    connection.release();
                    if (err) return reject(err);
                    resolve(results[0]);
                });
            });
        });
    }
}

module.exports = userService