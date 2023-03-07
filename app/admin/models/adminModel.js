let logService  = require('./logModel'),
    crypto      = require('crypto'),
	webService  = require('../../web/models/webModel');

let adminService = {
	addToLog: function(req, res, message) {
		try {
			var user_id = 0;
			if (req.user) {
				user_id = req.user.id;
			}
			let short_message = '';
			let full_message = '';
			if (typeof message === "string") {
				full_message = message;
			} else if (message instanceof Error) {
				full_message = JSON.stringify(message);
				short_message = message.message ? message.message : '';
			}else{
				full_message = JSON.stringify(message);
				short_message = message.sql ? message.sql : '';
			}
			webService.addRecordTable({user_id:user_id,short_message:short_message, full_message: full_message, page_url: req.originalUrl,referrer_url:req.headers.referer}, "log_err").then(responseData =>{
				if(responseData.success && responseData.data.insertId){
					res.redirect('/admin/error/' + responseData.data.insertId);
				}else{
					res.redirect('/admin/error/');
				}
			});
		} catch (error) {
			console.log("addToLog catch", error);
		}
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
			return;
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
			return {};
		}
	},
	salt: function () {
		return "salt!@#$%^&*())6";
	}
}
module.exports = adminService;