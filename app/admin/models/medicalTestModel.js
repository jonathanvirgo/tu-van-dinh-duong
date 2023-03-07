var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let medicalTestService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO medical_test (name,type,hospital_id,department_id,created_by) VALUES (?,?,?,?,?)";
                var query = connection.query(sql, [parameter.name,parameter.type,parameter.hospital_id,parameter.department_id,parameter.created_by], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'medicalTestService create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE medical_test SET name = ?, type = ?, hospital_id = ?, department_id = ?, created_by = ? WHERE id=?';
                var query = connection.query(sql, [parameter.name,parameter.type, parameter.hospital_id, parameter.department_id, parameter.created_by, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'medicalTestService update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM medical_test WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'medicalTestService delete');
                return callback(error);
            }
        });
    },
    countAllMedicalTest: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM medical_test WHERE id > 0';
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
                    }else if(parameter.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND department_id = ?";
                        paraSQL.push(parameter.department_id);
                    }
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'medicalTestService countAllMedicalTest');
                return callback(error);
            }
        });
    },
    getAllMedicalTest: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM medical_test WHERE id > 0';
                
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
                    }else if(parameter.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND department_id = ?";
                        paraSQL.push(parameter.department_id);
                    }
                }
                sql += " ORDER BY id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'medicalTestService getAllMedicalTest');
                return callback(error);
            }
        });
    },
    getMedicalTestById: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM medical_test WHERE id = ?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'medicalTestService getMedicalTestById');
                return callback(error);
            }
        });
    }
}

module.exports = medicalTestService;