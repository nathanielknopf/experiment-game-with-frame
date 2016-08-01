var express = require('express')
var app = express()
var moment = require('moment')

var fs = require('fs')
var vm = require('vm')
vm.runInThisContext(fs.readFileSync(__dirname + '/config.js'))

var use_db = configs.use_db
var time_to_play = configs.play_time
var experiments_posted = 0

try {
	var https = require('https')
	var port = configs.https_port
	var privateKey = fs.readFileSync(configs.private_key)
	var certificate = fs.readFileSync(configs.certificate)
	var credentials = {key: privateKey, cert: certificate}
	var server = https.createServer(credentials, app)
	var io = require('socket.io').listen(server)
} catch(err){
	console.log("HTTPS failed to launch -- falling back to HTTP")
	var http = require('http')
	var port = configs.http_port
	var server = http.createServer(app)
	var io = require('socket.io').listen(server)
}

if(use_db){
	var mysql = require('mysql')
	var database = require(__dirname + '/js/database')
	var connection = mysql.createConnection({
		host		: 'localhost',
		user		: 'root',
		password	: 'cocolab',
		database	: 'test'
	})
}

app.use(express.static(__dirname));

app.get(/^(.+)$/, function(req, res){ 
     console.log('static file request : ' + req.params);
     console.log("ACCESS: " + req.params[0])
     res.sendFile(__dirname + req.params[0])
 });

var getTimestamp = function(){
	var date = moment().format().slice(0, 10)
	var time = moment().format().slice(11, 19)
	return date + ' ' + time
}

//namespace for assigning experiment parameters
var expnsp = io.of('/experiment-nsp')
expnsp.on('connection', function(socket){

	var assignConditions = function(){
		//code for determining the condition of the experiment
		//for now, assign a constant value
		var condition = (experiments_posted % 2 == 0) ? 'a' : 'b'
		var question_order = (experiments_posted < 6) ? 'q1' : 'q2'
		socket.emit('condition', {condition: condition, question_order: question_order})
		experiments_posted += 1
	}

	assignConditions()
})

var gamensp = io.of('/game-nsp')
gamensp.on('connection', function(socket){
	
	var hs = socket.handshake
	var query = require('url').parse(socket.handshake.headers.referer, true).query
	var condition = (query.condition) ? query.condition : 'a'
	var user = (query.workerId) ? query.workerId : 'undefinedID'

	var fruit_score = 0
	var animal_score = 0

	var animal_actions = ['get cow', 'get chicken', 'get sheep', 'get pig']
	var fruit_actions = ['get apple', 'get grape', 'get pineapple', 'get lemon']
	
	var discovered = []
	var time_points = {}

	console.log("Connection from user: " + user + ".")

	var timer = function(seconds){
		setTimeout(function(){
			if (seconds >= 1){
				socket.emit('timer', seconds - 1)
				timer(seconds - 1)
			} else {
				// var destination = '/exitsurvey.html?user=' + user + '&condition=' + condition
				var destination = '/exitsurvey.html'
				socket.emit('redirect', destination)
				console.log("Redirecting " + user + ".")
			}
		}, 1000)
	}

	timer(time_to_play)

	if(use_db){
		database.addPlayer(user, condition)
	}

	var first_line = '"' + getTimestamp() + '","connected"'
	fs.writeFile('resultCSVs/' + user + '.csv', first_line, function(err){
		if(err){
			console.log(err)
		}
	})

	var updateCSV = function(action){
		var to_append = '"' + getTimestamp() + '","' + action + '"'
		fs.appendFile('resultCSVs/' + user + '.csv', to_append, function(err){
			if(err){
				console.log(err)
			}
		})
	}

	var updateDB = function(action){
		database.updatePlayer(user, condition, action, fruit_score, animal_score)
	}

	socket.on('action', function(action){
		console.log(action)
		if(discovered.indexOf(action) == -1){
			discovered.push(action)
		}
		if(animal_actions.indexOf(action) >= 0){
			animal_score += 1
		}else if(fruit_actions.indexOf(action) >= 0){
			fruit_score += 1
		}
		updateCSV(action)
		if(use_db){
			updateDB()
		}
	});

	socket.on('discconect', function(){
		updateCSV('disconnected')
		discovery_string = 'summary of discoveries\n'
		for (var i = 0; i < discovered.length; i++){
			discovery_string += discovered[i] + '\n'
		}
		fs.writeFile('resultCSVs/' + user + '-discoveries.txt', discovery_string, function(err){
			if(err){
				console.log(err)
			}
		})
	})
})

server.listen(port, function(){
	console.log("Game server listening port " + port + ".")
	if(use_db){
		console.log("Logging in mysql database.")
	}
})
