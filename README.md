# Webizing

Using npm, install all the necessary node modules when running the files.
You can run the files without installing any node modules and see what the error says to find which modules to install; You will probably need to install orbit-db and ipfs for sure though: 
```
npm install orbit-db ipfs@0.33.0
```


## Running the server on local

1. Open up a terminal inside the local copy of the repository, and run the code for local server:
```
node main_Local.js
```
2. To test if the local server is doing the content-negotiation properly, open up another terminal inside the same directory, and run one of the following:
```
node inputData_Local.js testJSON.json
```
```
node jsonld_validator_Local.js
```
```
node jsonld_validator2_Local.js
```

## Running the actual server

1. Update the actual server by uploading the main.js file onto the server.
2. Reboot the server so that the update takes place.
3. To test if the actual server is doing the content-negotiation properly, open up a terminal inside the local copy of the repository, and run the test code for actual server:
```
node inputData.js testJSON.json
```
