var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let foodTypeService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO food_type (name, hospital_id,department_id,created_by) VALUES (?,?,?,?)";
                var query = connection.query(sql, [parameter.name,parameter.hospital_id,parameter.department_id,parameter.created_by], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodTypeModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE food_type SET name = ?, hospital_id = ?, department_id = ?, created_by = ? WHERE id=?';
                var query = connection.query(sql, [parameter.name, parameter.hospital_id, parameter.department_id, parameter.created_by, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodTypeModel update');
                return callback(error);
            }
        });
    },
    delete: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM food_type WHERE id=?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodTypeModel delete');
                return callback(error);
            }
        });
    },
    countAllFoodType: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM food_type WHERE id > 0';
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                //Kh??ng ph???i Administrator th?? load c??c b???n ghi theo khoa vi???n
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //N???u l?? qu???n l?? load theo vi???n
                    if(parameter.role_ids.includes(5)){
                        sql += " AND hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }else if(parameter.role_ids.includes(4)){
                        //N???u l?? b??c s?? load theo khoa
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
                webService.addToLogService(error, 'foodTypeModel countAllFoodType');
                return callback(error);
            }
        });
    },
    getAllFoodTypeFromParam: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM food_type WHERE id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                //Kh??ng ph???i Administrator th?? load c??c b???n ghi theo khoa vi???n
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //N???u l?? qu???n l?? load theo vi???n
                    if(parameter.role_ids.includes(5)){
                        sql += " AND hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }else if(parameter.role_ids.includes(4)){
                        //N???u l?? b??c s?? load theo khoa
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
                webService.addToLogService(error, 'foodTypeModel getAllFoodTypeFromParam');
                return callback(error);
            }
        });
    },
    getAllFoodType: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM food_type WHERE id > 0 ORDER BY id';
                //Kh??ng ph???i Administrator th?? load c??c b???n ghi theo khoa vi???n
                if (!parameter.role_id.includes(1) && !parameter.role_id.includes(3)){
                    //N???u l?? qu???n l?? load theo vi???n
                    if(parameter.role_id.includes(5)){
                        sql += " AND hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }else if(parameter.role_id.includes(4)){
                        //N???u l?? b??c s?? load theo khoa
                        sql += " AND department_id = ?";
                        paraSQL.push(parameter.department_id);
                    }
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
                console.log("getAllFoodType", query.sql);
            } catch (error) {
                webService.addToLogService(error, 'foodTypeModel getAllFoodType');
                return callback(error);
            }
        });
    },
    getFoodTypeById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM food_type WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodTypeModel getFoodTypeById');
                return callback(error);
            }
        });
    }
}

module.exports = foodTypeService;