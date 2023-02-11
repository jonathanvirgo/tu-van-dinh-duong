var express         = require('express'),
    router          = express.Router(),
    path            = require('path');

router.get('/', function (req, res, next) {
  if(!req.user) {
    res.redirect('/user/login');
  } else {
      if (req.user.isAdmin) {
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

