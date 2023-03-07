var passport        = require('passport'),
    LocalStrategy   = require('passport-local').Strategy,
    userService     = require('./../admin/models/userModel'),
    roleUserService = require('./../admin/models/roleUsersModel'),
    logService      = require('./../admin/models/logModel'),
    crypto          = require('crypto'),
    webService      = require('./../web/models/webModel');

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        var arrPromise  = [],
            detailUser  = {
                id: 0,
                role_id: [],
                isAdmin: false,
                name: '',
                full_name: ''
            };

        arrPromise.push(new Promise(function (resolve, reject) {
            userService.getUserById(id, function (err, resUser, fields) {
                if (err) {
                    return webService.addToLogService(err, 'passport getUserById').then(log_id =>{
                        resolve();
                    });
                }
                if (resUser !== undefined) {
                    detailUser.id         = resUser[0].id;
                    detailUser.name       = resUser[0].name;
                    detailUser.email      = resUser[0].email;
                    detailUser.full_name  = resUser[0].full_name;
                    detailUser.phone      = resUser[0].phone;
                    detailUser.department_id   = resUser[0].department_id;
                    detailUser.department_name = resUser[0].department_name;
                    detailUser.hospital_id     = resUser[0].hospital_id;
                    detailUser.hospital_name   = resUser[0].hospital_name;
                }
                resolve();
            });
        }));
        
        arrPromise.push(new Promise(function (resolve, reject) {
            roleUserService.getRoleByUserId(id, function (err, result, fields) {
                if (err) {
                    return webService.addToLogService(err, 'passport getRoleByUserId').then(log_id =>{
                        resolve();
                    });
                }
                if (result !== undefined) {
                    for( var i = 0; i < result.length; i++){
                        detailUser.role_id.push(result[i].role_id);
                        if(result[i].role_id == 1){
                            detailUser.isAdmin = true;
                        }
                    }
                }
                resolve();
            }); 
        }));
        return new Promise(function (resolve, reject) {
            Promise.all(arrPromise).then(function () {
                if(detailUser.id > 0){
                    done(null, detailUser);
                } else {
                    done("Không tìm thấy thông tin người dùng");
                }
            });
        });
    });

    passport.use(new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        }, function(req, username, password, done) {
            console.log("getUser", username, password);
        userService.getUser(username, webService.saltHashPassword(password)).then(function(user) {
            console.log("passport.use",user);
            if (!user) {
                return done(null, false, { message: 'Sai tên đăng nhập hoặc mật khẩu!' });
            } else {  
        		return done(null, user);
            }
        }).catch(function(err) {
            return done(err);
        });
    }))
}
