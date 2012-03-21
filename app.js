
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , util = require('util')
  , User = require('./models/user');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , FacebookStrategy = require('passport-facebook').Strategy
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , GitHubStrategy = require('passport-github').Strategy
  , pass = require('./config/services');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Facebook profile is serialized
//   and deserialized.
passport.serializeUser(function(user, done) {
  //done(null, user);
  done(null, user.id);
});

passport.deserializeUser(function(obj, done) {
  //done(null, obj);
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
  function(username, password, done) {
        // asynchronous verification, for effect...
        //process.nextTick(function () {
            User.findOne({ username: username }, function (err, user) {
              if (err) { return done(err, false); }
              if (!user) { return done(null, false, { message: 'Unkown user ' + username }); }
              if (!user.verifyPassword(password)) { return done(null, false, { message: 'Invalid password' }); }
              return done(null, user);
            });
        //});
  }
));

passport.use(new FacebookStrategy({
    //https://developers.facebook.com/apps/203298939775074/summary?web_hosting=0
    clientID: pass.FACEBOOK_CLIENT_ID,
    clientSecret: pass.FACEBOOK_CLIENT_SECRET,
    callbackURL: pass.FACEBOOK_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function (err, user) {
      return done(err, user);
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: pass.GOOGLE_CLIENT_ID,
    clientSecret: pass.GOOGLE_CLIENT_SECRET,
    callbackURL: pass.GOOGLE_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function (err, user) {
      return done(err, user);
    });
  }
));

passport.use(new GitHubStrategy({
    clientID: pass.GITHUB_CLIENT_ID,
    clientSecret: pass.GITHUB_CLIENT_SECRET,
    callbackURL: pass.GITHUB_CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate(profile, function (err, user) {
      return done(err, user);
    });
  }
));

var app = module.exports = express.createServer();
var app_port = process.env.C9_PORT;

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboardcat' }));
  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
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
app.get('/account', ensureAuthenticated, routes.account);
app.get('/login', routes.login);
app.get('/verify', ensureAuthenticated, routes.verify);

app.post('/test',
  function(req, res) {
    console.log(req.body);
    //res.redirect('/');
  });
  
app.post('/login/local', passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  });
app.get('/login/local', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/account');
  });
  
// Redirect the user to Facebook for authentication.  When complete,
// Facebook will redirect the user back to the application at
// /auth/facebook/callback
app.get('/auth/facebook', passport.authenticate('facebook'),
  function(req, res){
    // The request will be redirected to Facebook for authentication, so this
    // function will not be called.
  });
  
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/userinfo.profile',
                                            'https://www.googleapis.com/auth/userinfo.email'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so
    // this function will not be called.
  });
  
app.get('/auth/github',
  passport.authenticate('github'),
  function(req, res){
    // The request will be redirected to GitHub for authentication, so this
    // function will not be called.
  });
// Facebook will redirect the user to this URL after approval.  Finish the
// authentication process by attempting to obtain an access token.  If
// access was granted, the user will be logged in.  Otherwise,
// authentication has failed.
// GET /auth/facebook/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/login', scope: ['email'] }),
  function(req, res) {
    if(req.user.needsVerification) res.redirect('/verify');
    else res.redirect('/account');
  });

app.get('/oauth2callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/account');
  });
  
app.get('/auth/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', scope: ['user'] }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/account');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
                                      
app.listen(app_port);
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
