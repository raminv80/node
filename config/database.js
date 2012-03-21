var MYSQL_USER = 'workpad_user';
var MYSQL_PASS = 'w0rkone2three';
var MYSQL_DATABASE = 'workpad_db2';
var MYSQL_HOST = '116.0.102.36';
var _mysql = require('mysql');

var mysql = _mysql.createClient({
    user: MYSQL_USER,
    password: MYSQL_PASS,
    host: MYSQL_HOST,
    database: MYSQL_DATABASE
});
exports.mysql = mysql;
