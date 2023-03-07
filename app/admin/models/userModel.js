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
                            department_id,
                            activePasswordToken,
                            resetPasswordExpires,
                            active) 
                            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;
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
                        parameter.department_id,
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
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql     = 'UPDATE user SET user_id = ?, name = ?, full_name = ?,password = ?,email = ?, phone = ?, gender = ?, birthday = ?, address = ?,hospital_id = ?, department_id = ?, last_ip = ?, active = ? WHERE id=?';
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
                    parameter.hospital_id,
                    parameter.department_id,
                    parameter.last_ip,
                    parameter.active,
                    parameter.id
                ];
                
                if(parameter.password == ''){
                    sql     = 'UPDATE user SET user_id = ?, name = ?, full_name = ?,email = ?, phone = ?, gender = ?, birthday = ?, address = ?,hospital_id = ?, department_id = ?, last_ip = ?, active = ? WHERE id=?';
                    paraSQL = [
                        parameter.user_id,
                        parameter.name,
                        parameter.full_name,
                        parameter.email,
                        parameter.phone,
                        parameter.gender,
                        parameter.birthday,
                        parameter.address,
                        parameter.hospital_id,
                        parameter.department_id,
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
                return callback(error);
            }
        });
    },
    getUserById: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT user.*, department.name AS department_name,department.id AS department_id, hospital.name AS hospital_name,  hospital.id AS hospital_id FROM `user`' 
                            + `LEFT JOIN department ON user.department_id = department.id
                            LEFT JOIN hospital ON department.hospital_id = hospital.id
                            WHERE user.id = ?`;
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService getUserById');
                return callback(error);
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
                //Không phải Administrator thì load các bản ghi theo khoa viện
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(parameter.role_ids.includes(5)){
                        sql += " AND hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }
                }
        
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'userService countAllUser');
                return callback(error);
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
                return callback(error);
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
                return callback(error);
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
                return callback(error);
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
                return callback(error);
            }
        });
    },
    getUser: function(name, password) {
        return new Promise(function(resolve, reject) {
            db.get().getConnection(function(err, connection) {
                try {
                    if (err) reject(err);
                    var sql   = 'SELECT * FROM user WHERE name = ? AND password = ?';
                    var query = connection.query(sql, [name, password], function (err, results, fields) {
                        connection.release();
                        if (err) return reject(err);
                        resolve(results[0]);
                    });
                } catch (error) {
                    webService.addToLogService(error, 'userService getUser');
                    reject(error);
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
                return callback(error);
            }
        });
    },
    // getUserByToken: function(token, expireDate) {
    //     db.get().getConnection(function(err, connection) {
    //         try {
    //             if (err) return callback(err);
    //             var sql   = 'SELECT * FROM user WHERE resetPasswordToken = ? && resetPasswordExpires > ?';
    //             var query = connection.query(sql, [token,expireDate], function (err, results, fields) {
    //                 connection.release();
    //                 if (err) return callback(err);
    //                 callback(null, results, fields);
    //             });
    //         } catch (error) {
    //             webService.addToLogService(error, 'userService getUserByToken');
    //         }
    //     });
    // },
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
                    resolve({
                        success: false,
                        message: error
                    });
                }
            });
        })
    },
    // getUserByPhoneOrEmail: function(param, expireDate) {
    //     db.get().getConnection(function(err, connection) {
    //         try {
    //             if (err) return callback(err);
    //             var sql   = 'SELECT * FROM user WHERE phone = ? OR email = ?';
    //             var query = connection.query(sql, [param.phone,param.email], function (err, results, fields) {
    //                 connection.release();
    //                 if (err) return callback(err);
    //                 callback(null, results, fields);
    //             });
    //         } catch (error) {
    //             webService.addToLogService(error, 'userService getUserByPhoneOrEmail');
    //         }
    //     });
    // },
}
module.exports = userService;