var express = require('express')
var http = require('http')

var app = express()
var server = http.createServer(app)

var port = (process.argv[2] == null) ? 8080 : process.argv[2]

app.use(express.static(__dirname))

app.get('/', function(req, res){
	res.sendFile(__dirname + '/experiment/experiment.html')
})

app.get(/^(.+)$/, function(req, res){
	console.log("ACCESS: " + req.params[0])
	res.sendFile(__dirname + req.params[0])
})

server.listen(port, function(){
	console.log("Server listening on port: " + port + ".")
})
