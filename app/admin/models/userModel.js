var db      = require('./../../config/db'),
webService  = require('../../web/models/webModel');

let userService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = `INSERT INTO user(
                            user_id,
                            name,
                            full_name,
                            password,
                            email,
                            phone,
                            gender,
                            birthday,
                            address,
                            activePasswordToken,
                            resetPasswordExpires,
                            active) 
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`;
                var query = connection.query(sql,
                    [
                        parameter.user_id,
                        parameter.name,
                        parameter.full_name,
                        parameter.password,
                        parameter.email,
                        parameter.phone,
                        parameter.gender,
                        parameter.birthday,
                        parameter.address,
                        parameter.activePasswordToken,
                        parameter.resetPasswordExpires,
                        parameter.active,
                    ],
                    function (err, results, fields) {
                        connection.release();
                        if (err) return callback(err);
                        callback(null, results, fields);
                    });
            } catch (error) {
                webService.addToLogService(error, 'userService create');
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql     = 'UPDATE user SET user_id = ?, name = ?, full_name = ?,password = ?,email = ?, phone = ?, gender = ?, birthday = ?, address = ?, last_ip = ?, active = ? WHERE id=?';
                var paraSQL = [
                    parameter.user_id,
                    parameter.name,
                    parameter.full_name,
                    parameter.password,
                    parameter.email,
                    parameter.phone,
                    parameter.gender,
                    parameter.birthday,
                    parameter.address,
                    parameter.last_ip,
                    parameter.active,
                    parameter.id
                ];
                
                if(parameter.password == ''){
                    sql     = 'UPDATE user SET user_id = ?, name = ?, full_name = ?,email = ?, phone = ?, gender = ?, birthday = ?, address = ?, last_ip = ?, active = ? WHERE id=?';
                    paraSQL = [
                        parameter.user_id,
                        parameter.name,
                        parameter.full_name,
                        parameter.email,
                        parameter.phone,
                        parameter.gender,
                        parameter.birthday,
                        parameter.address,
                        parameter.last_ip,
                        parameter.active,
                        parameter.id
                    ];
                }
        
                var query = connection.query(sql,paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService update');
            }
        });
    },
    getUserById: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM user WHERE id = ?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService getUserById');
            }
        });
    },
    countAllUser: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [],
                    active  = isNaN(parseInt(parameter.search_active)) ? -1 : parseInt(parameter.search_active),
                    sql     = 'SELECT COUNT(*) AS count FROM user WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                if (parameter.search_email != "") {
                    sql += " AND email LIKE ?";
                    paraSQL.push("%" + parameter.search_email + "%");
                }
                if (active >= 0) {
                    sql += " AND active = ?";
                    paraSQL.push(active);
                }
        
                if (parameter.search_role_ids != "" && parameter.search_role_ids != "0") {
                    sql += " AND id in (SELECT user_id FROM role_user WHERE role_id in(?))";
                    paraSQL.push(parameter.search_role_ids);
                }
        
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService countAllUser');
            }
        });
    },
    getAllUser: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [],
                    active  = isNaN(parseInt(parameter.search_active)) ? -1 : parseInt(parameter.search_active);
                var sql     =`select user.id,user.name,user.full_name,user.email,user.active,user.create_on,
                            role.role_id, role.role_name 
                            FROM user 
                            INNER JOIN role_user ON user.id = role_user.user_id 
                            INNER JOIN role ON role.role_id = role_user.role_id
                            WHERE user.id > 0`;
                
                if (parameter.search_name != "") {
                    sql += " AND user.name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                if (parameter.search_email != "") {
                    sql += " AND user.email LIKE ?";
                    paraSQL.push("%" + parameter.search_email + "%");
                }
                if (active >= 0) {
                    sql += " AND user.active = ?";
                    paraSQL.push(active);
                }
        
                if (parameter.search_role_ids != "" && parameter.search_role_ids != "0") {
                    sql += " AND role.role_id in (?)";
                    paraSQL.push(parameter.search_role_ids);
                }
        
                sql += " ORDER BY user.id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService getAllUser');
            }
        });
    },
    countUserByEmail: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT COUNT(*) AS count FROM user WHERE email = ?';
                if(parameter.user_id > 0){
                    sql += ' AND id != ?';
                }
                var query = connection.query(sql, [parameter.name, parameter.user_id], function (error, results, fields) {
                    connection.release();
                    if (error) return callback(error);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService countUserByEmail');
            }
        });
    },
    countUserByName: function(parameter, callback) {
        db.get().getConnection(function(err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT COUNT(*) AS count FROM user WHERE name = ?';
                if(parameter.user_id > 0){
                    sql += ' AND id != ?';
                }
                var query = connection.query(sql, [parameter.name, parameter.user_id], function (error, results, fields) {
                    connection.release();
                    if (error) return callback(error);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService countUserByName');
            }
        });
    },
    getUserByName: function(name, callback) {
        db.get().getConnection(function(err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM user WHERE name = ?';
                var query = connection.query(sql, [name], function (error, results, fields) {
                    connection.release();
                    if (error) return callback(error);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService getUserByName');
            }
        });
    },
    getUser: function(name, password) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                try {
                    if (err) return callback(err);
                    var sql   = 'SELECT * FROM user WHERE name = ? AND password = ?';
                    var query = connection.query(sql, [name, password], function (err, results, fields) {
                        connection.release();
                        if (err) return reject(err);
                        resolve(results[0]);
                    });
                } catch (error) {
                    webService.addToLogService(error, 'userService getUser');
                }
            });
        });
    },
    activeaccount: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql = 'UPDATE user SET activePasswordToken=?,resetPasswordExpires = ?, active =? WHERE id=?';
                var query = connection.query(sql,
                    [
                        parameter.activePasswordToken,
                        parameter.resetPasswordExpires,
                        parameter.active,
                        parameter.id
                    ],
                function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService activeaccount');
            }
        });
    },
    getUserByToken: function(token, expireDate) {
        db.get().getConnection(function(err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM user WHERE resetPasswordToken = ? && resetPasswordExpires > ?';
                var query = connection.query(sql, [token,expireDate], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService getUserByToken');
            }
        });
    },
    getUserByActivePasswordToken: function(token, expireDate) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                try {
                    if (err) {
                        resolve({
                            success: false,
                            message: err
                        });
                    }
                    var sql   = 'SELECT * FROM user WHERE activePasswordToken = ? && resetPasswordExpires > ?';
                    var query = connection.query(sql, [token, expireDate], function (error, results, fields) {
                        connection.release();
                        if (error) {
                            resolve({
                                success: false,
                                message: error
                            });
                        }
                        resolve({
                            success: true,
                            message: "Successful",
                            data: results
                        });
                    });
                } catch (error) {
                    webService.addToLogService(error, 'userService getUserByActivePasswordToken');
                }
            });
        })
    }
}
module.exports = userService;