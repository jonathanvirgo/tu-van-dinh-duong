var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let departmentService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO department (name,hospital_id,phone,created_by) VALUES (?,?,?,?)";
                var query = connection.query(sql, [parameter.name,parameter.hospital_id,parameter.phone,parameter.created_by], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'departmentModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE department SET name = ?, hospital_id = ?, phone = ?, created_by = ? WHERE id=?';
                var query = connection.query(sql, [parameter.name,parameter.hospital_id,parameter.phone, parameter.created_by, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'departmentModel update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM department WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'departmentModel delete');
                return callback(error);
            }
        });
    },
    countAllDepartment: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM department WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
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
                webService.addToLogService(error, 'departmentModel countAllDepartment');
                return callback(error);
            }
        });
    },
    getAllDepartment: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT department.*, hospital.name AS hospital_name FROM department INNER JOIN hospital ON department.hospital_id = hospital.id WHERE department.id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND department.name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                //Không phải Administrator thì load các bản ghi theo khoa viện
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(parameter.role_ids.includes(5)){
                        sql += " AND hospital.id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }
                }
                sql += " ORDER BY department.id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'departmentModel getAllDepartment');
                return callback(error);
            }
        });
    },
    getDepartmentById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM department WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'departmentModel getDepartmentById');
                return callback(error);
            }
        });
    },
    getAllDepartmentByHospital: function (id_hospital, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql     = 'SELECT id, name FROM department WHERE hospital_id = ?';
                
                var query = connection.query(sql, [id_hospital], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'departmentModel getAllDepartmentByHospital');
                return callback(error);
            }
        });
    },
}

module.exports = departmentService;