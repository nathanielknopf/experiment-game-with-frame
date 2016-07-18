var express = require('express')
var app = express()
var fs = require('fs')
var vm = require('vm')
var moment = require('moment')

vm.runInThisContext(fs.readFileSync(__dirname + '/config.js'))
var use_db = configs.use_db
var time_to_play = configs.play_time
var exit_survey_url = configs.exit_survey_url

var getTimestamp = function(){
	var date = moment().format().slice(0, 10)
	var time = moment().format().slice(11, 19)
	return date + ' ' + time
}

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

var gamensp = io.of('/game-nsp')
gamensp.on('connection', function(socket){

	//var socket_id = socket.id.slice(2)
	var socket_id = socket.id

	console.log("Connection from: " + socket_id)
	console.log(socket_id)
	
	var hs = socket.handshake
	var query = require('url').parse(socket.handshake.headers.referer, true).query
	var condition = (query.condition) ? query.condition : 'a'
	var user = (query.workerId) ? query.workerId : 'Undefined'

	var inventory = {
		pocket: 'empty',
		points: 0,
		apples: 0,
		fishes: 0
	}

	console.log("Connection from user: " + user + ".")

	if(use_db){
		database.addPlayer(user, condition, socket_id)
	}

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

	var updateDB = function(){
		if(use_db){
			database.updatePlayer(user, socket_id, condition, inventory.pocket, inventory.apples, inventory.fishes, inventory.points)
		}
	}
	
	socket.on('apples', function(direction){
		if(direction == 'more'){
			inventory.points += 1
			inventory.apples += 1
		}else if(direction == 'less'){
			inventory.apples -= 1
		}
		updateDB()
	})

	socket.on('fishes', function(direction){
		if(direction == 'more'){
			inventory.points += 2
			inventory.fishes += 1
		}else if(direction == 'less'){
			inventory.fishes -= 1
		}
		updateDB()
	})

	socket.on('rocks', function(){
		inventory.pocket = 'rock'
		updateDB()
	})

	socket.on('logs', function(){
		inventory.pocket = 'log'
		updateDB()
	})

	socket.on('pocket empty', function(){
		inventory.pocket = 'null'
		updateDB()
	})
})

server.listen(port, function(){
	console.log("Game server listening port " + port + ".")
	if(use_db){
		console.log("Logging in mysql database.")
	}
})
