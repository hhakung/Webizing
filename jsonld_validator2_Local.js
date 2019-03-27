var request = require('request');
var options = {
  headers: {'Content-Type' : 'application/ld+json'},
  url:     'http://localhost:3000/SmartWatch',
  method:	"GET"
}

request(options, function(error, response, body){
	if (!error) {
		console.log(response.headers['content-type']);
		console.log(JSON.parse(body));
	}
});