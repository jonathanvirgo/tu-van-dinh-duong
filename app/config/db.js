var mysql = require('mysql');
var state = {
    pool: null,
    mode: null
}
exports.MODE_PRODUCTION = 'mode_production';

exports.connect = function(mode, done) {
    state.pool = mysql.createPool({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'tuvandinhduong'
    });

    state.mode = mode;
}

exports.get = function() {
    return state.pool;
}

