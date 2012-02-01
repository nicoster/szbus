/**
	szbus
	A project which enables you query the bus status in Suzhou, a city close to ShangHai in China.
	Using nodejs
	
	Nick X (nicoster@gmail.com) Jan. 2012
 */

'use strict';

/**
 * Module dependencies.
 */

var	express = require('express')
	, dataquery = require('./datasource.js')
	, mongoose = require('mongoose')
	, app = module.exports = express.createServer()
	, Stop
	, Favorite
	, db
	;

function log(x){console.log(x);}

// Configuration
app.configure('development', function() {
  app.set('db-uri', 'mongodb://localhost/szbus-dev');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('test', function() {
  app.set('db-uri', 'mongodb://localhost/szbus-test');
});

app.configure('production', function() {
  app.set('db-uri', 'mongodb://localhost/szbus-production');
  app.use(express.errorHandler()); 
});

db = mongoose.connect(app.set('db-uri'));

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'youdontknow', maxAge: 1000*60*60*24*365 }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.Stop = Stop = require('./models.js').Stop(db);
//app.User = User = require('./models.js').User(db);
app.Favorite = Favorite = require('./models.js').Favorite(db);

// Routes

app.get('/', function(req, res){
	res.redirect('/fav');
});

app.get('/fav', function(req, res){
	Favorite.find({sid: req.cookies['connect.sid']}, function(err, favs){
	  res.render('fav', {'favs': favs});		
	});
});

app.post('/fav', function(req, res){
	log('post /fav');
	log(req.body);

	Stop.findOne({code: req.body.stop}, function(err, stop){
		var fav = new Favorite({sid: req.cookies["connect.sid"], name: stop.name, code: stop.code, buses: req.body.buses});
		fav.save();

		res.send('true');		
	});
});

app.post('/search', function(req, res){
//	console.log(req.body.stop);
	dataquery.getBusStops(req.body.stop, function(stops){
		
		// update db
		stops.forEach(function(stop)
		{
			var s = new Stop(stop);
			s.save();
		});
		
		res.render('stops', {
			criteria: req.body.stop,
			'stops':stops
		});
	});
});

// with filter
app.get('/update/:code.:format?', function(req, res){
	log('get /update:' + req.params.code);
	Stop.findOne({code: req.params.code}, function(err, stop){	// get stop name
		dataquery.getBusesByStop(stop, function(buses){		// get buses for this stop
			
			var selected = [];
			Favorite.find({sid: req.cookies['connect.sid']}, function(err, favs){	// get fav buses
				log(favs);
				favs.forEach(function(fav){
					fav.buses.forEach(function(favbus){
//						log('favbus:' + favbus);
						buses.forEach(function(businfo){
//							log('businfo.name:' + businfo.name);
							if (businfo.name.toString() === favbus.toString()){
								selected.push(businfo);
							}
						});
					});
				});
				
				var result = {
					'stop': stop,
					'buses': selected
				};
				log('_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/');
				log(result);
		    switch (req.params.format) {
		      case 'json':
		        res.send(result);
			      break;		

		      default:
						res.render('buses', result);					
				}				
			});
			
		});
	});
	
});


app.get('/stop/:code.:format?', function(req, res){
	Stop.findOne({code: req.params.code}, function(err, stop){
		dataquery.getBusesByStop(stop, function(buses){
			var result = {
				'stop': stop,
				'buses': buses
			};
	    switch (req.params.format) {
	      case 'json':
	        res.send(result);
		      break;		

	      default:
					res.render('buses', result);					
			}
		});
	});
	
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);







