var db           = require('./../../config/db'),
    adminService = require('./../models/adminModel');

module.exports.create = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = `INSERT INTO pr_user(
                    user_id,
                    name,
                    full_name,
                    password,
                    email,
                    phone,
                    gender,
                    birthday,
                    address,
                    last_ip,
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
                parameter.last_ip,
                parameter.activePasswordToken,
                parameter.resetPasswordExpires,
                parameter.active,
            ],
            function (err, results, fields) {
                connection.release();
                if (err) return callback(err);
                callback(null, results, fields);
            });
    });
}

module.exports.update = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql     = 'UPDATE pr_user SET user_id = ?, name = ?, full_name = ?,password = ?,email = ?, phone = ?, gender = ?, birthday = ?, address = ?, last_ip = ?, active = ? WHERE id=?';
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
            sql     = 'UPDATE pr_user SET user_id = ?, name = ?, full_name = ?,email = ?, phone = ?, gender = ?, birthday = ?, address = ?, last_ip = ?, active = ? WHERE id=?';
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
    });
}

module.exports.getUserById = function (id, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT * FROM pr_user WHERE id = ?';
        var query = connection.query(sql, [id], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.countAllUser = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var paraSQL = [],
            active  = isNaN(parseInt(parameter.search_active)) ? -1 : parseInt(parameter.search_active),
            sql     = 'SELECT COUNT(*) AS count FROM pr_user WHERE id > 0';
        
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
            sql += " AND id in (SELECT user_id FROM pr_role_user WHERE role_id in(?))";
            paraSQL.push(parameter.search_role_ids);
        }

        var query = connection.query(sql, paraSQL, function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.getAllUser = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var paraSQL = [],
            active  = isNaN(parseInt(parameter.search_active)) ? -1 : parseInt(parameter.search_active);
        var sql     =`select pr_user.id,pr_user.name,pr_user.full_name,pr_user.email,pr_user.active,pr_user.create_on,
                      pr_role.role_id, pr_role.role_name 
                      FROM pr_user 
                      INNER JOIN pr_role_user ON pr_user.id = pr_role_user.user_id 
                      INNER JOIN pr_role ON pr_role.role_id = pr_role_user.role_id
                      WHERE pr_user.id > 0`;
        
        if (parameter.search_name != "") {
            sql += " AND pr_user.name LIKE ?";
            paraSQL.push("%" + parameter.search_name + "%");
        }
        if (parameter.search_email != "") {
            sql += " AND pr_user.email LIKE ?";
            paraSQL.push("%" + parameter.search_email + "%");
        }
        if (active >= 0) {
            sql += " AND pr_user.active = ?";
            paraSQL.push(active);
        }

        if (parameter.search_role_ids != "" && parameter.search_role_ids != "0") {
            sql += " AND pr_role.role_id in (?)";
            paraSQL.push(parameter.search_role_ids);
        }

        sql += " ORDER BY pr_user.id DESC LIMIT " + parameter.skip + "," + parameter.take;
        var query = connection.query(sql, paraSQL, function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.countUserByEmail = function(parameter, callback) {
    db.get().getConnection(function(err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT COUNT(*) AS count FROM pr_user WHERE email = ?';
        if(parameter.user_id > 0){
            sql += ' AND id != ?';
        }
        var query = connection.query(sql, [parameter.name, parameter.user_id], function (error, results, fields) {
            connection.release();
            if (error) return callback(error);
            callback(null, results, fields);
        });
    });
}

module.exports.countUserByName = function(parameter, callback) {
    db.get().getConnection(function(err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT COUNT(*) AS count FROM pr_user WHERE name = ?';
        if(parameter.user_id > 0){
            sql += ' AND id != ?';
        }
        var query = connection.query(sql, [parameter.name, parameter.user_id], function (error, results, fields) {
            connection.release();
            if (error) return callback(error);
            callback(null, results, fields);
        });
    });
}

module.exports.getUserByName = function(name, callback) {
    db.get().getConnection(function(err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT * FROM pr_user WHERE name = ?';
        var query = connection.query(sql, [name], function (error, results, fields) {
            connection.release();
            if (error) return callback(error);
            callback(null, results, fields);
        });
    });
}

module.exports.getUser = function(name, password) {
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

module.exports.activeaccount = function (parameter, callback) {
    db.get().getConnection(function (err, connection) {
        if (err) return callback(err);
        var sql = 'UPDATE pr_user SET activePasswordToken=?,resetPasswordExpires = ?, active =? WHERE id=?';
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
    });
}

module.exports.getUserByToken = function(token, expireDate) {
    db.get().getConnection(function(err, connection) {
        if (err) return callback(err);
        var sql   = 'SELECT * FROM pr_user WHERE resetPasswordToken = ? && resetPasswordExpires > ?';
        var query = connection.query(sql, [token,expireDate], function (err, results, fields) {
            connection.release();
            if (err) return callback(err);
            callback(null, results, fields);
        });
    });
}

module.exports.getUserByActivePasswordToken = function(token, expireDate) {
    return new Promise(function(resolve, reject) {
        db.get().getConnection(function(err, connection) {
            if (err) {
                resolve({
                    success: false,
                    message: err
                });
            }
            var sql   = 'SELECT * FROM pr_user WHERE activePasswordToken = ? && resetPasswordExpires > ?';
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
        });
    })
}