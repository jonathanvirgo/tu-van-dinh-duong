var db      = require('./../../config/db'),
webService  = require('../../web/models/webModel');

let roleService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO role(role_name) VALUES (?)";
                var query = connection.query(sql, [parameter.role_name], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE role SET role_name = ? WHERE role_id=?';
                var query = connection.query(sql, [parameter.role_name, parameter.role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel update');
                return callback(error);
            }
        });
    },
    delete: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM role WHERE role_id=?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel delete');
                return callback(error);
            }
        });
    },
    countAllRole: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM role WHERE role_id > 0';
                if (parameter.search_name != "") {
                    sql += " AND role_name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel countAllRole');
                return callback(error);
            }
        });
    },
    getAllRole: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM role WHERE role_id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND role_name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                sql += " ORDER BY role_id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel getAllRole');
                return callback(error);
            }
        });
    },
    searchAllRole: function (callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM role';
                var query = connection.query(sql, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel searchAllRole');
                return callback(error);
            }
        });
    },
    getRoleById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM role WHERE role_id=?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel getRoleById');
                return callback(error);
            }
        });
    },
    getAllRoleNameByUserId: function (user_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT role_name FROM role WHERE role_id in(SELECT role_id FROM role_user WHERE user_id=?)';
                var query = connection.query(sql, [user_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'roleModel getAllRoleNameByUserId');
                return callback(error);
            }
        });
    }
}

module.exports = roleService;