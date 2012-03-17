
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes');

var passport = require('passport')
  , FacebookStrategy = require('passport-facebook').Strategy;

passport.use(new FacebookStrategy({
    //https://developers.facebook.com/apps/203298939775074/summary?web_hosting=0
    clientID: 203298939775074,//FACEBOOK_APP_ID,
    clientSecret: "b9a7bb0b88d306032a71d019a14139c0",//FACEBOOK_APP_SECRET,
    callbackURL: "http://node.raminv80.c9.io/auth/facebook/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(null, function (err, user) {
      if (err) { return done(err); }
      done(null, user);
    });
  }
));

var app = module.exports = express.createServer();
var app_port = process.env.C9_PORT;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/user', routes.user);
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
// /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'));
// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { successRedirect: '/user',
                                      failureRedirect: '/login' }));
                                      
app.listen(app_port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
