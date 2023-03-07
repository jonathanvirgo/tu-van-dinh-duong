var db      = require('../../config/db'),
webService  = require('../../web/models/webModel');

let nutritionAdviceService = {
    create: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = "INSERT INTO nutrition_advice (name,glucid_should_use,glucid_limited_use,glucid_should_not_use,protein_should_use,protein_limited_use,protein_should_not_use,lipid_should_use,lipid_limited_use,lipid_should_not_use,vitamin_ck_should_use,vitamin_ck_limited_use,vitamin_ck_should_not_use,created_at,hospital_id,department_id,created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP,?,?,?)";
                var query = connection.query(sql, [
                    parameter.name,
                    parameter.glucid_should_use,
                    parameter.glucid_limited_use,
                    parameter.glucid_should_not_use,
                    parameter.protein_should_use,
                    parameter.protein_limited_use,
                    parameter.protein_should_not_use,
                    parameter.lipid_should_use,
                    parameter.lipid_limited_use,
                    parameter.lipid_should_not_use,
                    parameter.vitamin_ck_should_use,
                    parameter.vitamin_ck_limited_use,
                    parameter.vitamin_ck_should_not_use,
                    parameter.hospital_id,
                    parameter.department_id,
                    parameter.created_by
                ], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService create');
                return callback(error);
            }
        });
    },
    update: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'UPDATE nutrition_advice SET name = ?, glucid_should_use = ?, glucid_limited_use = ?, glucid_should_not_use = ?, protein_should_use = ?, protein_limited_use = ?, protein_should_not_use = ?, lipid_should_use = ?, lipid_limited_use = ?, lipid_should_not_use = ?, vitamin_ck_should_use = ?, vitamin_ck_limited_use = ?, vitamin_ck_should_not_use = ?, hospital_id = ?, department_id = ?, created_by = ? WHERE id=?';
                var query = connection.query(sql, [
                    parameter.name,
                    parameter.glucid_should_use,
                    parameter.glucid_limited_use,
                    parameter.glucid_should_not_use,
                    parameter.protein_should_use,
                    parameter.protein_limited_use,
                    parameter.protein_should_not_use,
                    parameter.lipid_should_use,
                    parameter.lipid_limited_use,
                    parameter.lipid_should_not_use,
                    parameter.vitamin_ck_should_use,
                    parameter.vitamin_ck_limited_use,
                    parameter.vitamin_ck_should_not_use,
                    parameter.hospital_id,
                    parameter.department_id,
                    parameter.created_by,
                    parameter.id
                ], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService update');
                return callback(error);
            }
        });
    },
    delete: function (role_id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'DELETE FROM nutrition_advice WHERE id=?';
                var query = connection.query(sql, [role_id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService delete');
                return callback(error);
            }
        });
    },
    countAllNutritionAdvice: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT COUNT(*) AS count FROM nutrition_advice WHERE id > 0';
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
                webService.addToLogService(error, 'nutritionAdviceService countAllNutritionAdvice');
                return callback(error);
            }
        });
    },
    getAllNutritionAdvice: function (parameter, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var paraSQL = [];
                var sql     = 'SELECT * FROM nutrition_advice WHERE id > 0';
                
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
                webService.addToLogService(error, 'nutritionAdviceService getAllNutritionAdvice');
                return callback(error);
            }
        });
    },
    getNutritionAdviceById: function (id, callback) {
        db.get().getConnection(function (err, connection) {
            try {
                if (err) return callback(err);
                var sql   = 'SELECT * FROM nutrition_advice WHERE id = ?';
                var query = connection.query(sql, [id], function (err, results, fields) {
                    connection.release();
                    if (err) return callback(err);
                    callback(null, results, fields);
                });
            } catch (error) {
                webService.addToLogService(error, 'nutritionAdviceService getNutritionAdviceById');
                return callback(error);
            }
        });
    }
}

module.exports = nutritionAdviceService;