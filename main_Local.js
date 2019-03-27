var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    accepts = require('accepts'),
    fs = require("fs"),
    port = process.argv[2] || 3000;

http.createServer(function(request, response) {
  
  var accept = accepts(request),
      uri = url.parse(request.url).pathname;

  // the order of this list is significant; should be server preferred order
  switch (accept.type(['json', 'html'])) {
    
    case 'json':
      // handling the html requests
      var filename = uri + '.jsonld';

      // handling the request for the home page (where the uri is '/')
      if(uri == '/') {
        filename = uri + 'index.jsonld';
      }

      var fullpath = path.join(__dirname, 'JSONLD_Files', filename);
	  
	  fs.exists(fullpath, function(exists) {
		var contents = fs.readFileSync(fullpath, "utf8");
		response.writeHead(200, {"Content-Type": "application/json"});
		response.write(JSON.stringify(contents), "utf8");
		response.end();
	  });
	  
      break;

    case 'html':

      // handling the html requests
      var filename = uri + '.html';

      // handling the request for the home page (where the uri is '/')
      if(uri == '/') {
        filename = uri + 'index.html';
      }

      var fullpath = path.join(__dirname, 'HTML_Files', filename);
	  
	  fs.exists(fullpath, function(exists) {
		var contents = fs.readFileSync(fullpath, "utf8");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(contents, "utf8");
		response.end();
	  });
	  
      break;

    default:
      // default; send out the html file.
      var filename = uri + '.html';

      // handling the request for the home page (where the uri is '/')
      if(uri == '/') {
        filename = uri + 'index.html';
      }

      var fullpath = path.join(__dirname, 'HTML_Files', filename);
	  
	  fs.exists(fullpath, function(exists) {
		var contents = fs.readFileSync(fullpath, "utf8");
		response.writeHead(200, {"Content-Type": "text/html"});
		response.write(contents, "utf8");
		response.end();
	  });
	  
      break;
  }
}).listen(parseInt(port, 10));


console.log("Static file server running at\n  => https://localhost:" + port + "/\nCTRL + C to shutdown");


//TODO:
/*
  ****** REFER TO: https://gist.github.com/ryanflorence/701407 ******
*/
