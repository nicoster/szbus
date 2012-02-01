var http = require("http");
var $ = require('jquery');


function request(options, handler)
{
	options.isPost = function(){return !!this.data;};
	options.method = options.isPost() ? 'POST' : 'GET';	
	options.host = 'm.sz-map.com';
	options.port = 80;
	
	if (options.isPost())
	{
		options.headers = {
			'Content-Length' : Buffer.byteLength(options.data),
			'Content-Type' : 'application/x-www-form-urlencoded'
		};		
	}
	
	console.log(options);
	console.log('isPost:' + options.isPost());
	
	var chunks = '', req = http.request(options, function(res) {
	  res.setEncoding('utf8');
	  res.on('data', function (chunk) {
			chunks += chunk;
	  });
		res.on('end', function (){
			handler(chunks);
		});
	});

	req.on('error', function(e) {
	  console.log('problem with request: ' + e.message);
		handler('');
	});

	if (options.isPost()){
		req.write(options.data);
	}
		
	req.end();	
}

function getBusesByStop(stop, next)
{
	var options = {
	  path: '/real?st=0&dataGuid=' + stop.code + '&sln=' + stop.name + '&rt=n&address=' + stop.address,
		method: 'GET',
	};
	
	request(options, function(html){
		var buses = [];
		$(html).find('#results table').each(function(index, el){
			buses.push({
				name: $(el).find('a').text(),
				hop: $(el).find('td span').text()
			});
		});
		console.log(buses);
		next(buses);
	});
}

function getBusStops(stop, next)
{
	var options = {
	  path: '/search',
		data: 'kw=' + stop
	};
	
	request(options, function(html){
		var stops = [], reg = /dataGuid=[A-Z]{3}/;
		$(html).find('#results table').each(function(index, el){
			var a = $(el).find('a');
			stops.push({
				code:reg.exec(a.attr('href')).toString().substr(9, 3),
				name:a.text(),
				address:$(el).find('td:eq(0)').text(),
				buses:$(el).find('td:eq(1)').text()
			});
		});
		console.log(stops);
		next(stops);
	});
}


exports.getBusStops = getBusStops;
exports.getBusesByStop = getBusesByStop;