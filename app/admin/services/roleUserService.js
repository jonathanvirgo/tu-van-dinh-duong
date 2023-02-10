
let roleUserService = {
    getRoleByUserId : function (user_id, callback) {
        db.get().getConnection(function (err, connection) {
            if (err) return callback(err);
            var sql   = 'SELECT role_id FROM pr_role_user WHERE user_id=?';
            var query = connection.query(sql, [user_id], function (err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
        });
    }
}

module.exports = roleUserService