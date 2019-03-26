var http = require("http"),
    https = require("https"),
    url = require("url"),
    path = require("path"),
    accepts = require('accepts'),
    fs = require("fs"),
    port = process.argv[2] || 443;


const privateKey = fs.readFileSync('/etc/letsencrypt/live/schema.iot.webizing.org/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/schema.iot.webizing.org/cert.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/schema.iot.webizing.org/chain.pem', 'utf8');
const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

https.createServer(credentials,function(request, response) {
  
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
      break;

    case 'html':

      // handling the html requests
      var filename = uri + '.html';

      // handling the request for the home page (where the uri is '/')
      if(uri == '/') {
        filename = uri + 'index.html';
      }

      var fullpath = path.join(__dirname, 'HTML_Files', filename);
      break;

    default:
      // default; send out the html file.
      var filename = uri + '.html';

      // handling the request for the home page (where the uri is '/')
      if(uri == '/') {
        filename = uri + 'index.html';
      }

      var fullpath = path.join(__dirname, 'HTML_Files', filename);
      break;
  }

  fs.exists(fullpath, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    fs.readFile(fullpath, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));


console.log("Static file server running at\n  => https://localhost:" + port + "/\nCTRL + C to shutdown");


//TODO:
/*
  ****** REFER TO: https://gist.github.com/ryanflorence/701407 ******
*/
