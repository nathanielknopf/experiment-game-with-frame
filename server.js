var express = require('express')
var app = express()
var fs = require('fs')
var vm = require('vm')

vm.runInThisContext(fs.readFileSync(__dirname + '/config.js'))
var use_db = configs.use_db
var time_to_play = configs.play_time
var exit_survey_url = configs.exit_survey_url

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

io.on('connection', function(socket){

	var socket_id = socket.id.slice(2)

	console.log("Connection from: " + socket_id)
	console.log(socket_id)
	
	var hs = socket.handshake
	var query = require('url').parse(socket.handshake.headers.referer, true).query
	var condition = (query.condition) ? query.condition : 'a'
	var user = (query.workerId) ? query.workerId : 'Undefined'

	var inventory = {
		pocket: 'empty',
		points: 0
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

	socket.on('apples', function(apples){
		inventory.points += 1
		if(use_db){
			database.updatePlayer(user, socket_id, condition, inventory.pocket, inventory.points)
		// 	database.updatePlayer(socket_id, 'apples', apples)
		}
	})

	socket.on('rocks', function(rock){
		inventory.pocket = rock
		if(use_db){
			database.updatePlayer(user, socket_id, condition, inventory.pocket, inventory.points)
			// database.updatePlayer(socket_id, 'rocks', rock)
		}
	})
})

server.listen(port, function(){
	console.log("Game server listening port " + port + ".")
	if(use_db){
		console.log("Logging in mysql database.")
	}
})
