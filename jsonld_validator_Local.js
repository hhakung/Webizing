var jsonld_request = require('jsonld-request');

jsonld_request('http://localhost:3000', function(err, res, data) {
	console.log(data);
});