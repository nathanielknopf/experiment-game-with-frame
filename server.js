var express = require('express')
var app = express()
var moment = require('moment')

var fs = require('fs')
var vm = require('vm')
vm.runInThisContext(fs.readFileSync(__dirname + '/config.js'))

var use_db = configs.use_db
var time_to_play = configs.play_time
var experiments_posted = 0

var turkers = {}
var global_comp_tasks = ['all', 'fruits', 'animals', 'aquatics', 'apple', 'cow', 'fish']
var supplements = ["Collect as many rocks as you can. Throw them at the other objects to generate a 3rd object.", "Definitely throw the rocks.", "Look for the rocks and avoid everything else because they prevent you from moving.", "Trees and pools don't allow you to interact"]

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
		var condition = (experiments_posted % 2 == 0) ? 'a' : 'b'
		var question_order = (experiments_posted < 6) ? 'q1' : 'q2'
		var supplement
		if(experiments_posted <= 2){
			supplement = supplements[0]
		}else if(experiments_posted <= 5){
			supplement = supplements[1]
		}else if(experiments_posted <= 8){
			supplement = supplements[2]
		}else{
			supplement = supplements[3]
		}
		socket.emit('condition', {condition: condition, question_order: question_order, supplement: supplement})
		experiments_posted += 1
	}

	assignConditions()

})

var qagamensp = io.of('/qagame-nsp')
qagamensp.on('connection', function(socket){


	socket.on('request', function(data_packet){
		var workerId = data_packet.workerId
		var old_task = turkers[workerId].task
		var next_task = turkers[workerId].comp_tasks[turkers[workerId].comp_tasks.indexOf(old_task) + 1]
		turkers[workerId].task = next_task
		turkers[workerId].comp_actions.push({task: next_task, actions: []})
		console.log('task: ' + next_task + ' for: ' + workerId)
		if(next_task == 'done'){
			var to_write = ''
			for(var i = 0; i < turkers[workerId].comp_actions.length; i++){
				var to_write = ''
				var comp_actions_set = turkers[workerId].comp_actions[i]
				for(var j = 0; j < comp_actions_set.actions.length; j++){
					to_write += 'task: ' + comp_actions_set.task + ' - action: ' + comp_actions_set.actions[j] + '\n'
				}
				console.log(to_write)
			}
			// fs.writeFileSync('resultCSVs/' + workerId + '-comprehension.txt', to_write, function(err){
			// 	if(err){
			// 		console.log(err)
			// 	}
			// })
			socket.emit('redirect', '/thanks.html')
		}else{
			socket.emit('task', next_task)
		}
	})

	socket.on('action', function(action_packet){
		console.log(action_packet)
		var workerId = action_packet.workerId
		var action_done = action_packet.action
		turkers[workerId].comp_actions[turkers[workerId].comp_actions.length - 1].actions.push(action_done)
		fs.appendFile('resultCSVs/' + workerId + '-comprehension.txt', 'task: ' + turkers[workerId].task + ', action: ' + action_done + '\n', function(err){
			if(err){
				console.log(err)
			}
		})
	})

})

var surveynsp = io.of('/survey-nsp')
surveynsp.on('connection', function(socket){

	console.log('connection to survey nsp')

	socket.on('response', function(response_packet){
		var workerId = response_packet.workerId
		var response_packet = {question:response_packet.question, response: response_packet.response}
		turkers[workerId].responses.push(response_packet)
		console.log('thing: ' + turkers[workerId].responses)
	})

	socket.on('request', function(workerId){
		console.log('request from ' + workerId + ', sending: ' + turkers[workerId].responses)
		socket.emit('responses', {responses:turkers[workerId].responses})
	})

})

var gamensp = io.of('/game-nsp')
gamensp.on('connection', function(socket){
	
	var hs = socket.handshake
	var query = require('url').parse(socket.handshake.headers.referer, true).query
	var condition = (query.condition) ? query.condition : 'a'
	var user = (query.workerId) ? query.workerId : 'undefinedID'

	fs.writeFile('resultCSVs/' + user + '-comprehension.txt', 'Comprehension Summary\n', function(err){
		if(err){
			console.log(err)
		}
	})

	turkers[user] = {
		task: 'new',
		comp_actions: [],
		responses: [],
		comp_tasks: global_comp_tasks.sort(function(){return 0.5-Math.random()})
	}

	turkers[user].comp_tasks.splice(0, 0, "new")
	turkers[user].comp_tasks.splice(turkers[user].comp_tasks.length, 0, "done")
	console.log(turkers[user].comp_tasks)
	global_comp_tasks = ['all', 'fruits', 'animals', 'aquatics', 'apple', 'cow', 'fish']

	var score = 0

	var plus_score_actions = ['get cow', 'get chicken', 'get pig', 'get apple', 'get grape', 'get lemon', 'get fish', 'get whale', 'get crab']
	var minus_score_actions = ['shoot cow', 'shoot chicken', 'shoot pig', 'shoot apple', 'shoot grape', 'shoot lemon', 'shoot fish', 'shoot whale', 'shoot crab']
	
	var discovered = []
	var time_points = []

	console.log("Connection from user: " + user + ".")

	var timer = function(seconds){
		setTimeout(function(){
			if (seconds >= 1){
				socket.emit('timer', seconds - 1)
				timer(seconds - 1)
			} else {
				// var destination = '/exitsurvey.html?user=' + user + '&condition=' + condition
				var destination = '/survey.html'
				socket.emit('redirect', destination)
				console.log("Redirecting " + user + ".")

				discovery_string = 'summary of discoveries\n'
				for (var i = 0; i < discovered.length; i++){
					discovery_string += discovered[i] + '\n'
				}
				fs.writeFile('resultCSVs/' + user + '-discoveries.txt', discovery_string, function(err){
					if(err){
						console.log(err)
					}
				})

				score_string = '"time","points"\n'
				for (var i = 0; i < time_points.length; i++){
					score_string += '"' + time_points[i].time + '","' + time_points[i].score + '"\n'
				}
				fs.writeFile('resultCSVs/' + user + '-scores.csv', score_string, function(err){
					if(err){
						console.log(err)
					}
				})

			}
		}, 1000)
	}

	timer(time_to_play)

	if(use_db){
		database.addPlayer(user, condition)
	}

	var first_line = '"' + getTimestamp() + '","connected"\n'
	fs.writeFile('resultCSVs/' + user + '.csv', first_line, function(err){
		if(err){
			console.log(err)
		}
	})

	var updateCSV = function(action){
		var to_append = '"' + getTimestamp() + '","' + action + '"\n'
		fs.appendFile('resultCSVs/' + user + '.csv', to_append, function(err){
			if(err){
				console.log(err)
			}
		})
	}

	var updateDB = function(action){
		database.updatePlayer(user, condition, action, score)
	}

	socket.on('action', function(action){
		console.log(action)
		if(discovered.indexOf(action) == -1){
			discovered.push(action)
		}
		if(plus_score_actions.indexOf(action) >= 0){
			score += 1
			time_points.push({time:getTimestamp(), score:score})
		}else if(minus_score_actions.indexOf(action) >= 0){
			score -= 1
			time_points.push({time:getTimestamp(), score:score})
		}
		updateCSV(action)
		if(use_db){
			updateDB(action)
		}
	});
})

server.listen(port, function(){
	console.log("Game server listening port " + port + ".")
	if(use_db){
		console.log("Logging in mysql database.")
	}
})
