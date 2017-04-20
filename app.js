
/**
	* Node.js Login Boilerplate
	* More Info : http://kitchen.braitsch.io/building-a-login-system-in-node-js-and-mongodb/
	* Copyright (c) 2013-2016 Stephen Braitsch
**/

var http = require('http');
var express = require('express');
var routes  = require( './routes' );
var session = require('express-session');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var cookieParser = require('cookie-parser');
var MongoStore = require('connect-mongo')(session);
var schedule = require('node-schedule');
var GM = require('./modules/game-manager');

var app = express();

app.locals.pretty = true;
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// build mongo database connection url //

var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;
var dbName = process.env.DB_NAME || 'node-login';

var dbURL = 'mongodb://'+dbHost+':'+dbPort+'/'+dbName;
if (app.get('env') == 'live'){
// prepend url with authentication credentials // 
	dbURL = 'mongodb://'+process.env.DB_USER+':'+process.env.DB_PASS+'@'+dbHost+':'+dbPort+'/'+dbName;
}

app.use(session({
	secret: 'faeb4453e5d14fe6f6d04637f78077c76c73d1b4',
	proxy: true,
	resave: true,
	saveUninitialized: true,
	store: new MongoStore({ url: dbURL })
	})
);
/*

	var Status = schedule.scheduleJob('0.1 * * * *', function(){ 
				today = new Date();
				today_year = today.getFullYear(); 
				today_month = today.getMonth()+1; 
				today_date = today.getDate(); 
				today_hours = today.getHours(); 
				today_minutes = today.getMinutes(); 
				today_seconds = today.getSeconds(); 
				var CurrentDate = today_year+"-"+today_month+"-"+today_date+"  "+today_hours+":"+today_minutes+":"+today_seconds;
                GM.getAllRecords(function(err, users) {
                    users.forEach(function(user) {
                        if((Date.parse(user.date)).valueOf() < (Date.parse(CurrentDate)).valueOf()){
	                        GM.finishing(function(e){
							if (e){
								console.log("ok");
							}	else{
								console.log("error");
							}
						});
                      }
                    })
                });
	});
*/
require('./routes')(app);

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});
