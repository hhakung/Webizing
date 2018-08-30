var http = require('http'),
	accepts = require('accepts'),
	url = require('url'),
	path = require('path'),
	fs = require('fs'),
	mongo = require('mongodb'),
	MongoClient = require('mongodb').MongoClient,
	url = "mongodb://localhost:27017/";

module.exports.insertDataIntoDB = function() {
	// For getting the sensor data;
	// Setting the options for a HTTP request; for getting a jsonld file back
	const options_sensor = {
		'hostname': 'www.url_of_the_cloud_or_the_sensor.com', // change this to reflect the actual address
		'path': '/some_sensor_directory',
		'headers': {
			'Content-Type': 'application/ld+json'
		}
	};

	// Sending a HTTP GET request to either the sensor or the cloud for getting a sensor data
	http.get(options_sensor, function(res_sensor) {
		// Accumulate data until all the data has been received
		var body_sensor = '';
		res_sensor.on('data', function(chunk) {
			body_sensor += chunk;
		});

		// If we are done receiving all the data, convert it into a JSON object
		res_sensor.on('end', function() {
			// convert the data into a JSON object
			var parsed_sensor = JSON.parse(body_sensor);
			
			// var body_sensor = { 
			// 	"@context": "http://schema.iot.webizing.org/", 
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

			// var parsed_sensor = body_sensor;

			// console.log('Sensor data received: ' + JSON.stringify(body_sensor));
			// console.log('hostname: ' + parsed_sensor['@context']);
			// console.log('path: ' + '/' + parsed_sensor['@type']);

			var hostnameString = parsed_sensor['@context'].substring(7, parsed_sensor['@context'].length - 1);
			// console.log('hostnameString: ' + hostnameString);

			// For getting the vocab data;
			// Setting the options for a HTTP request; for getting a jsonld file back
			const options_vocab = {
				'hostname': hostnameString,
				'path': '/' + parsed_sensor['@type'],
				'headers': {
					'Content-Type': 'application/ld+json'
				}
			};

			// Sending a HTTP GET request to the vocabulary
			http.get(options_vocab, function(res_vocab) {
				// Accumulate data until all the data has been received
				var body_vocab = '';
				res_vocab.on('data', function(chunk) {
					body_vocab += chunk;
				});

				// If we are done receiving all the data, first, connect to the MongoDB and convert the data into a JSON object
				res_vocab.on('end', function() {
					// convert the data into a JSON object
					var parsed_vocab = JSON.parse(body_vocab);
					// console.log('Vocab data received: ' + body_vocab);

					// create a JSON object to input
					var inputJSON = {};

					// Set the MongoDB properties using the properties in the JSONLD graph
					var i;
					for (i = 0; i < parsed_vocab['@graph'].length; i++) {
					//for (item in parsed_vocab['@graph']) {
						var item = parsed_vocab['@graph'][i];
						if (item['@type'] == 'rdf:Property') {
							var property = item['rdfs:label'];
							// console.log('property: ' + item['rdfs:label']);

							// if the property doesn't exist, do not store this data and just return
							if (!parsed_sensor.hasOwnProperty(property))
							{
								return;
							}

							// adding property value pair to the JSON input object
							inputJSON[property] = parsed_sensor[property];
						}
					}

					// console.log('inputJSON: ' + JSON.stringify(inputJSON));

					// if we are here, it means that the data has all the properties; it's safe to input the object into the db now
					MongoClient.connect(url, function(err, db) {
						if (err) throw err;
						var dbo = db.db('test');
						dbo.collection(parsed_sensor['@type']).insertOne(inputJSON, function(err, res) {
							if (err) throw err;
							// console.log('Following document inserted: ' + JSON.stringify(inputJSON));
							db.close();
						});
					});

				});

			});

		});

	});

	return;
}





















