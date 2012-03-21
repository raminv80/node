var db = require('../config/database');

var users = [
    { id: 1, username: 'bob', password: 'secret', email: 'bob@example.com' }
  , { id: 2, username: 'joe', password: 'birthday', email: 'joe@example.com' }
];

exports.findOne = function(username, cb){
    cb(null, false);
}

exports.verifyPassword = function(password){
    return false;
}

exports.findById = function(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

exports.findByUsername = function(username, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}

exports.findOrCreate = function(profile, cb){
        //if there's any error then return errFunc('error message', false);
        var err = null;
        var query;
        if(profile.provider == "facebook")
            query = 'select * from users, user_profiles where users.user_id = user_profiles.user_id and facebook_id = ?';
        if(profile.provider == "google")
            query = 'select * from users, user_profiles where users.user_id = user_profiles.user_id and google_id = ?';
        if(profile.provider == "github")
            query = 'select * from users, user_profiles where users.user_id = user_profiles.user_id and github_id = ?';
        db.mysql.query(query, [profile.id],
        function selectCb(err, results, fields) {
			if (err) {
                throw err;
                cb(err, false);
			}else{
				//console.log(results);
                //console.log(fields);
                if(results.length>0){
                    //user already exists so build user object for app
                    cb(err, profile);
                }else{
                    //user is new. ask for an email,username and pass
                    //username by default comes from profile but needs to be processed so its not already taken
                    //if email already exists save the profile id somewhere, inform/send user to fotgot pass 
                    //and after successful login if profile_id doesn't exist add it to db
                    profile.needsVerification = true;
                    cb(err, profile);
                }
			}
		});
    }