var express      = require('express'),
    router       = express.Router(),
    path         = require('path'),
    adminService = require('./../models/adminModel'),
    logService   = require('./../models/logModel'); 

router.get('/:id', function (req, res, next) {
    if (!req.user) {
        res.redirect('/user/login');
    } else {
        logService.getLogById(req.params.id, function (err, result, fields) {
            if (err) {
                adminService.addToLog(req, res, err);
                return;
            }
            if(result[0] == undefined){
                adminService.addToLog(req, res, 'Không tìm thấy log có log_id=' + req.params.id);
                return;
            }
            var return_url = '',
                urlArray   = result[0].page_url.split("/");
            
            if(urlArray.length >= 2){
                if(urlArray[1] == 'admin' && urlArray[2] != 'error'){
                    return_url = '/' + urlArray[1] + '/' + urlArray[2];
                }
            }    
            
            res.render(viewPage("index"), {
                user: req.user,
                return_url: return_url,
                short_message: result[0].short_message,
                full_message: result[0].full_message
            });
        })
    }
});

function viewPage(name) {
    return path.resolve(__dirname, "../views/error/" + name + ".ejs");
}

module.exports = router;