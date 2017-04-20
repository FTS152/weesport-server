
var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var GM = require('./modules/game-manager');
var EM = require('./modules/email-dispatcher');



module.exports = function(app) {

// main login page //
	app.get('/', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('index.ejs', { title: 'Hello - Please Login To Your Account' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/add');
				}	else{
					res.render('login', { title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/', function(req, res){
		AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				if (req.body['remember-me'] == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}
				res.status(200).send(o);
			}
		});
	});
	
// logged-in user addpage //
	
	app.get('/add', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('add', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/add', function(req, res){
		GM.addNewGame({
			sport 	: req.body['sport'],
			date 	: req.body['date'],
			team 	: req.body['team'],
			locat	: req.body['locat'],
			contact : req.body['contact'],
			user 	: req.session.user._id,
			candidator:null,
			matcher : null
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.redirect('/list');
			}
		});
	});

	 app.get('/list',function(req, res) {
                var games = {};
                GM.getAllRecords(function(err, users) {
                    users.forEach(function(user) {
                        console.log(user);
                        games[user._id.toString()] = user;
                    })
                    return res.json(games);
                });

        });


	 app.get('/list/game/:URL',function(req, res) {
	 			var url = req.params.URL;
				GM.findById(url,function(err, game) {
						console.log(game);
		                if(game.status==0&&req.session.user._id!=game.user){
		                	game.manipulateType="matching";
		                }
		                else if(game.status==0&&req.session.user._id==game.user){
		                	game.manipulateType="selecting";
		                }
		                else if(game.status==1){
		                	game.manipulateType="justviewing";
		                }
		                else if(game.status==2&&req.session.user._id==game.user){
		                	game.manipulateType="ranking";
		                }
		                else if(game.status==2&&req.session.user._id!=game.user){
		                	game.manipulateType="justviewing";
		                }
                    	res.render('listgame.ejs', {'game': game});
                });

        });

	 app.post('/list/game/:URL',function(req, res) {
	 			var url = req.params.URL;
				if(req.body['button']=="matching"){
						GM.candidate(url,req.session.user, function(e){
						if (e){
							res.status(400).send(e);
						}	else{
							res.redirect('/list');
						}
					});
				}
				if(req.body['button']=="selecting"){
						GM.selecting(url,req.body['id'], function(e){
						if (e){
							res.status(400).send(e);
						}	else{
							res.redirect('/list');
						}
					});
				}
				if(req.body['button']=="ranking"){
						GM.ranking(url,req.body['rank'], function(e){
						if (e){
							res.status(400).send(e);
						}	else{
							res.redirect('/list');
						}
					});
				}

        });


	app.post('/logout', function(req, res){
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e){ res.status(200).send('ok'); });
	})
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup.ejs', {  title: 'Signup', countries : CT });
	});
	
	app.post('/signup', function(req, res){
		AM.addNewAccount({
			name 	: req.body['name'],
			email 	: req.body['email'],
			user 	: req.body['user'],
			pass	: req.body['pass'],
			country : req.body['country']
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});

	app.get('*', function(req, res) { res.render('404.ejs', { title: 'Page Not Found'}); });

};
