
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', user: req.user })
};

exports.account = function(req, res){
  res.render('account', { title: 'Account', user: req.user })
};

exports.login = function(req, res){
  res.render('login', { title: 'Login', user: req.user });
};