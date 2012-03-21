
/*
 * GET home page.
 */
 
var User = require('../models/user');

exports.index = function(req, res){
  res.render('index', { title: 'Express', user: req.user })
};

exports.account = function(req, res){
  res.render('account', { title: 'Account', user: req.user })
};

exports.login = function(req, res){
  res.render('login', { title: 'Login'+User.user, user: req.user, message: req.flash('error') });
};

exports.verify = function(req, res){
  res.render('verify', { title: 'Verify '+((typeof req.user!='undefined')?req.user.provider:'')+' account at Workpad', user: req.user});  
};