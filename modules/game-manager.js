
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

/*
	ESTABLISH DATABASE CONNECTION
*/

var dbName = process.env.DB_NAME || 'node-login';
var dbHost = process.env.DB_HOST || 'localhost'
var dbPort = process.env.DB_PORT || 27017;

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
db.open(function(e, d){
	if (e) {
		console.log(e);
	} else {
		if (process.env.NODE_ENV == 'live') {
			db.authenticate(process.env.DB_USER, process.env.DB_PASS, function(e, res) {
				if (e) {
					console.log('mongo :: error: not authenticated', e);
				}
				else {
					console.log('mongo :: authenticated and connected to database :: "'+dbName+'"');
				}
			});
		}	else{
			console.log('mongo :: connected to database :: "'+dbName+'"');
		}
	}
});

var games = db.collection('games');

/* login validation methods */


/* record insertion, update & deletion methods */

exports.addNewGame = function(newData, callback)
{
	newData.status = 0;
	newData.rank = 0;
	games.insert(newData, {safe: true}, callback);

}

exports.getAllRecords = function(callback)
{
	games.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

exports.ranking = function(id,rank,callback)
{
	games.update( {_id: getObjectId(id)},{ $set : {rank:rank} },callback)
}

exports.candidate = function(id,candidator,callback)
{
	games.update( {_id: getObjectId(id)},{ $push : {candidator:candidator} },callback)
}

exports.selecting = function(id,matcher,callback)
{
	games.update( {_id: getObjectId(id)},{ $set : {status:1} },callback)
	games.update( {_id: getObjectId(id)},{ $set : {matcher:matcher} },callback)
}

exports.finishing = function(callback)
{
	games.update( {_id: getObjectId(id)},{ $set : {status:2} },callback)
}
exports.deleteGame = function(id, callback)
{
	games.remove({_id: getObjectId(id)}, callback);
}

exports.findById = function(id, callback)
{
	games.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
}

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

exports.delAllRecords = function(callback)
{
	games.remove({}, callback); // reset games collection for testing //
}
