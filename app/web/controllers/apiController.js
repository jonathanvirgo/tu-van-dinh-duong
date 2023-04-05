var express         = require('express'),
    router          = express.Router(),
    moment          = require('moment'),
    logService      = require('../../admin/models/logModel'),
    webService      = require('./../models/webModel'),
    examineService  = require('./../models/examineModel');

router.get('/get-menu-example', (req, res, next) => {
    try {
        return res.json({a: "b", c:"d"});
    } catch (error) {
        
    }
})

module.exports = router;