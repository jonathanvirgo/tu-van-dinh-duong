let env   = require('dotenv').config();
var mysql = require('mysql');
var state = {
    pool: null,
    mode: null
}
exports.MODE_PRODUCTION = 'mode_production';

exports.connect = function(mode, done) {
    try {
        state.pool = mysql.createPool({
            host: 'localhost',
            user: env.parsed.DATABASE_USER,
            password: env.parsed.DATABASE_PASSWORD,
            database: env.parsed.DATABASE_URL
        });
        console.log("env", env);
        state.mode = mode;
    } catch (error) {
        console.log("error", error);
    }
    
}

exports.get = function() {
    return state.pool;
}

