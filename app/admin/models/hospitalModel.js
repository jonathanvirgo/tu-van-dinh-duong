var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let hospitaService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO hospital(name,prefix,phone,address) VALUES (?,?,?,?)";
                var query = connection.query(sql, [parameter.name,parameter.prefix,parameter.phone,parameter.address], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE hospital SET name = ?, prefix = ?, address = ?, phone = ? WHERE id=?';
                var query = connection.query(sql, [parameter.name,parameter.prefix,parameter.address,parameter.phone, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM hospital WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel delete');
                return callback(error);
            }
        });
    },
    countAllHospital: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM hospital WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel countAllHospital');
                return callback(error);
            }
        });
    },
    getAllHospitalFromParam: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM hospital WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel getAllHospitalFromParam');
                return callback(error);
            }
        });
    },
    getHospitalById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM hospital WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel getHospitalById');
                return callback(error);
            }
        });
    },
    getAllHospital: function (callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM hospital ORDER BY id DESC';

                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel getAllHospital');
                return callback(error);
            }
        });
    },
    checkPrefix: function(prefix, callback){
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT COUNT(id) AS total FROM hospital WHERE prefix = ?';
                var query = connection.query(sql, [prefix], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'hospitalModel update');
                return callback(error);
            }
        });
    }
}

module.exports = hospitaService;