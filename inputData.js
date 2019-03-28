var fs = require('fs'),
    request = require('request');

const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');

// Configuration for IPFS instance
const ipfsOptions = {
	repo: './orbitdb/examples/ipfs',
	start: true,
	EXPERIMENTAL: {
		pubsub: true
	}
}

// Configuration for the database
const dbConfig = {
	// If database doesn't exist, create it
	create: true,
	// Don't wait to load from the network
	sync: false,
	// Load only the local version of the database
	localOnly: true,
	// Allow anyone to write to the database
	admin: ['*'],
	write: ['*']
}

var filename = process.argv[2];

fs.readFile(filename, 'utf8', function(err, data) {
	if (err) throw err; // Make sure that we can open the file

	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// READ THE FILE
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// This data file is created using some pre-processing.
	// The file format looks like the following:
	// { 
	// 	"@context": "https://schema.iot.webizing.org/", 
	// 	"@type": "SmartWatch", 
	// 	"name": "Foobot00", 
	// 	"user": "jonghoLee", 
	// 	"address": "kist-l1", 
	// 	"room": "L8321", 
	// 	"location": "On the table", 
	// 	"time": "2017-05-30T18:54:20+09:00", 
	// 	"startDate": "2017-09-10T00:00:00+09:00", 
	// 	"endDate": "2017-09-10T06:30:00+09:00", 
	// 	"stepCount": "1830", 
	// 	"heartRate": "115", 
	// 	"exerciseTime": "95.5", 
	// 	"standHour": "1.02" 
	// }

	var parsed_sensor = JSON.parse(data); // create a JSON data object using the data that was read in
	//console.log(parsed_sensor);


	////////////////////////////////////////////////////////////////////////////////////////////////////////
	// CHECK WITH THE SCHEMA AND VALIDATE THE JSON OBJECT
	////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	// get the host name (URL) of the schema
	var hostnameString = parsed_sensor['@context'] + parsed_sensor['@type'];
	console.log(hostnameString);

	// set the options for a HTTP request; for getting a JSON object back
	const options_vocab = {
		 'headers': {'Content-Type' : 'application/ld+json'},
		 'url':     hostnameString,
		 'method':  'GET'
	};

	// Make a function for getting the vocab data
	function getVocabData(callback){
		request(options_vocab, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				console.log(response.headers['content-type']);
				// convert the data into a JSON object
				var parsedData = JSON.parse(body);
				return callback(null, parsedData);
				
			} else {
				return callback(error, null);
			}
		});
	};
	
	// Send a request to the vocabulary
	getVocabData(function(err, parsed_vocab) {
		if (!err) {
			parsed_vocab = JSON.parse(parsed_vocab);
			
			// create a JSON object to input
			var inputJSON = {};
			
			// set the inputJSON properties using the properties in the JSONLD graph
			var i;
			for (i = 0; i < parsed_vocab['@graph'].length; i++) {
				var item = parsed_vocab['@graph'][i];

				if (item['@type'] == 'rdf:Property') {
					var property = item['rdfs:label'];
					// console.log('property: ' + item['rdfs:label']);

					// if the property doesn't exist, put an empty string for the value of that property
					if (!parsed_sensor.hasOwnProperty(property))
					{
						inputJSON[property] = "";

					} else {
						// otherwise, add the value from the parsed_sensor to the inputJSON to the corresponding field
						inputJSON[property] = parsed_sensor[property];
					}
				}
			}
			
			console.log(inputJSON);
			
			////////////////////////////////////////////////////////////////////////////////////////////////////////
			// SET UP IPFS AND ORBIT-DB
			////////////////////////////////////////////////////////////////////////////////////////////////////////

			// Create IPFS instance
			const ipfs = new IPFS(ipfsOptions)

			ipfs.on('error', (e) => console.error(e))
			ipfs.on('ready', async () => {
				let db;
				
				try {
					// Create OrbitDB instance
					const orbitdb = new OrbitDB(ipfs);
					
					// Create / Open a database
					db = await orbitdb.eventlog('example', dbConfig);

					// Add an entry
					const hash = await db.add(inputJSON);
					console.log(hash);

					// Try getting that entry again, to verify that it's been added correctly to the db
					const event = db.get(hash);
					console.log(event);
				} catch (e) {
					console.error(e);
					process.exit(1);
				}
			});

			////////////////////////////////////////////////////////////////////////////////////////////////////////
			// PUT THE VALIDATED JSON OBJECT INTO THE ORBIT-DB USING IPFS PUB-SUB
			////////////////////////////////////////////////////////////////////////////////////////////////////////
			
		} else {
			console.log(err);
		}
	});
});







