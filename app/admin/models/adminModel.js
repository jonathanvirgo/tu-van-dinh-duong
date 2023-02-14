let logService  = require('./logModel')
    crypto      = require('crypto')
	webService  = require('../../web/models/webModel');

let adminService = {
	addToLog: function(req, res, message) {
	    return logService.create(req, message).then(function(log_id){
            res.redirect('/admin/error/' + log_id);
	    });
	},
	parseDay: function(time) {
		try {
			var date        = new Date(time);
			var month       = (date.getMonth() + 1) < 10 ? '0' + (date.getMonth() + 1) : (date.getMonth() + 1);
			var day         = (date.getDate()) < 10 ? '0' + (date.getDate()) : (date.getDate());
			var hours       = (date.getHours()) < 10 ? '0' + (date.getHours()) : (date.getHours());
			var minute      = (date.getMinutes) < 10 ? '0' + (date.getMinutes()) : (date.getMinutes());
			var dateformat  = date.getFullYear() + '-' + month + '-' + day;
			return dateformat;
		} catch (error) {
			webService.addToLogService(error, 'parseDay');
		}
    },
    sha512: function (password, salt) {
		try {
			var hash = crypto.createHmac('sha512', salt);
			hash.update(password);
			var value = hash.digest('hex');
			return {
				salt: salt,
				passwordHash: value
			};
		} catch (error) {
			webService.addToLogService(error, 'sha512');
		}
	},
	salt: function () {
		return "salt!@#$%^&*())6";
	}
}
module.exports = adminService;