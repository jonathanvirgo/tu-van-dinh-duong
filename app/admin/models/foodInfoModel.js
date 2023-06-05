var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let foodInfoService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO food_info (name,food_type_id,weight,energy,protein,animal_protein,lipid,unanimal_lipid,carbohydrate,created_at,hospital_id,department_id,created_by) VALUES (?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?,?,?)";
                var query = connection.query(sql, [parameter.name,parameter.food_type_id,parameter.weight,parameter.energy,parameter.protein,parameter.animal_protein,parameter.lipid,parameter.unanimal_lipid,parameter.carbohydrate,parameter.hospital_id,parameter.department_id,parameter.created_by], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodInfoModel create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE food_info SET name = ?, food_type_id = ?, weight = ?, energy = ?, protein = ?, animal_protein = ?, lipid = ?, unanimal_lipid = ?, carbohydrate = ?, hospital_id = ?, department_id = ?, created_by = ? WHERE id=?';
                var query = connection.query(sql, [parameter.name,parameter.food_type_id,parameter.weight,parameter.energy,parameter.protein,parameter.animal_protein,parameter.lipid,parameter.unanimal_lipid,parameter.carbohydrate,parameter.hospital_id,parameter.department_id,parameter.created_by, parameter.id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodInfoModel update');
                return callback(error);
            }
        });
    },
    delete: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM food_info WHERE id=?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodInfoModel delete');
                return callback(error);
            }
        });
    },
    countAllFoodInfo: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM food_info WHERE id > 0';
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
                        sql += " AND (created_by = ? OR share = 1)";
                        paraSQL.push(parameter.created_by);
                    }
                }
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodInfoModel countAllFoodInfo');
                return callback(error);
            }
        });
    },
    getAllFoodInfo: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT food_info.*, food_type.name AS food_type_name FROM food_info INNER JOIN food_type ON food_info.food_type_id = food_type.id WHERE food_info.id > 0';
                
                if (parameter.search_name != "") {
                    sql += " AND food_info.name LIKE ?";
                    paraSQL.push("%" + parameter.search_name + "%");
                }
                //Không phải Administrator thì load các bản ghi theo khoa viện
                if (!parameter.role_ids.includes(1) && !parameter.role_ids.includes(3)){
                    //Nếu là quản lý load theo viện
                    if(parameter.role_ids.includes(5)){
                        sql += " AND food_info.hospital_id = ?";
                        paraSQL.push(parameter.hospital_id);
                    }else if(parameter.role_ids.includes(4)){
                        //Nếu là bác sĩ load theo khoa
                        sql += " AND (food_info.created_by = ? OR share = 1)";
                        paraSQL.push(parameter.created_by);
                    }
                }
                sql += " ORDER BY food_info.id DESC LIMIT " + parameter.skip + "," + parameter.take;
                var query = connection.query(sql, paraSQL, function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodInfoModel getAllFoodInfo');
                return callback(error);
            }
        });
    },
    getFoodInfoById: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM food_info WHERE id = ?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodInfoModel getFoodInfoById');
                return callback(error);
            }
        });
    },
    getAllFoodInfoByFoodType: function (id_food_type, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql     = 'SELECT id, name FROM food_info WHERE food_type_id = ?';
                
                var query = connection.query(sql, [id_food_type], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'foodInfoModel getAllFoodInfoByFoodType');
                return callback(error);
            }
        });
    },
}

module.exports = foodInfoService;