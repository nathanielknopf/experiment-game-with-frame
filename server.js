var express = require('express')
var http = require('http')
var fs = require('fs')
var vm = require('vm')

vm.runInThisContext(fs.readFileSync(__dirname + '/config.js'))

var app = express()
var server = http.createServer(app)
var io = require('socket.io').listen(server)
var database = require(__dirname + '/js/database')

var time_to_play = configs.play_time
var port = configs.port
var use_db = configs.use_db
var exit_survey_url = configs.exit_survey_url

if(use_db){
	var mysql = require('mysql')
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
	var user = (query.user) ? query.user : 'Undefined'

	console.log("Connection from user: " + user + ".")

	if(use_db){
		database.addPlayer(user, socket_id)
	}

	var timer = function(seconds){
		setTimeout(function(){
			if (seconds >= 1){
				socket.emit('timer', seconds - 1)
				timer(seconds - 1)
			} else {
				var destination = exit_survey_url + '?user=' + user + '&condition=' + condition
				socket.emit('redirect', destination)
				console.log("Redirecting " + user + ".")
			}
		}, 1000)
	}

	timer(time_to_play)

	socket.on('apples', function(apples){
		if(use_db){
			database.updatePlayer(socket_id, 'apples', apples)
		}
	})

	socket.on('rocks', function(rock){
		if(use_db){
			database.updatePlayer(socket_id, 'rocks', rock)
		}
	})
})

server.listen(port, function(){
	console.log("Game server listening port " + port + ".")
	if(use_db){
		console.log("Logging in mysql database.")
	}
})
