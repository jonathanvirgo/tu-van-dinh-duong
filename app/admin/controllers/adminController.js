var express         = require('express'),
    router          = express.Router(),
    path            = require('path');

router.get('/', function (req, res, next) {
  if(!req.user) {
    res.redirect('/user/login');
  } else {
      if (req.user.isAdmin || (req.user.role_id && (req.user.role_id.includes(3) || req.user.role_id.includes(5) || req.user.role_id.includes(4)))) {
        res.render(viewPage("index"), { 
          title: 'Admin', 
          user: req.user 
        });
      } else {
			 res.redirect('/');
	  }
  }
});

function viewPage(name) {
  return path.resolve(__dirname, "../views/home/" + name + ".ejs");
}

module.exports = router;

