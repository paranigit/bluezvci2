/**
 * Copyright 2014 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var app = require('express')(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	bluemix = require('./config/bluemix'),
	watson = require('watson-developer-cloud'),
	extend = require('util')._extend;


// Bootstrap application settings
require('./config/express')(app);

//if bluemix credentials exists, then override local
var loginS2T = extend({
	version:'v1',
  	url: "https://stream.watsonplatform.net/speech-to-text-beta/api",
	username: '1b13df06-c917-425c-9268-2f5790618322',
	password: 'ZbSBQkseVXH1'
}, bluemix.getServiceCreds('speech_to_text')); // VCAP_SERVICES


// if bluemix credentials exists, then override local
var loginT2S = extend({
  version: 'v1',
  url: "https://stream.watsonplatform.net/text-to-speech-beta/api",
  username: 'd0fa3425-e058-4e23-9285-98e4687bd743',
  password: 'OGoO1NzRj7EQ',
  headers: { 'Accept': 'audio/ogg; codecs=opus' }
}, bluemix.getServiceCreds('text_to_speech')); // VCAP_SERVICES


// Create the service wrapper
var textToSpeech = new watson.text_to_speech(loginT2S);
var speechToText = new watson.speech_to_text(loginS2T);

//Configure sockets
require('./config/socket')(io, speechToText);

// render index page
app.get('/', function(req, res) {	
  res.render('index');
});

app.get('/synthesize', function(req, res) {
  var transcript = textToSpeech.synthesize(req.query);
  console.log(transcript);
  transcript.on('response', function(response) {
    console.log(response.headers);
  });
  transcript.pipe(res);
});

app.get('/readPolicy',function(req, res){
	console.log(req.query);
	var fs  = require("fs");
	var str = {};
	fs.readFileSync('./public/excel/policyData.csv').toString().split('\n').forEach(function (line) { 
	    str = line.toString().split(",");
	    if (str[3] === req.query.mobileNo){
	    	return res.json(line);
	    }
	});
	console.log("mobile not found.");
	return res.json(null);
});

var port = process.env.VCAP_APP_PORT || 3000;
server.listen(port);
console.log('VCI started & listening at:', port);
