var mysql = require('mysql')
var moment = require('moment')
var fs = require('fs')
var vm = require('vm')
vm.runInThisContext(fs.readFileSync(__dirname + '/../config.js'))

var pool = mysql.createPool({
	connectionLimit	: 100,
	host			: configs.mysql_host,
	user			: configs.mysql_user,
	password		: configs.mysql_password,
	database		: configs.mysql_database,
	debut			: false
})

var getTimestamp = function(){
	var date = moment().format().slice(0, 10)
	var time = moment().format().slice(11, 19)
	return date + ' ' + time
}

var queryThis = function(to_query){
	pool.getConnection(function(err, connection){
		if (err) {
			console.log("ERROR CONNECTING: " + err)
			return
		}

		connection.query(to_query, function(err, rows){
			connection.release()
			if (err){
				console.log("ERROR QUERYING: " + err)
				console.log("\n\nERROR WITH QUERY: " + to_query)
			} else {
				console.log("Query: '" + to_query + "'' was succesful")
			}
		})

		connection.on('error', function(err){
			console.log("GENERAL ERROR: " + err)
			return
		})
	})
}

var createTable = function(workerID){
	var new_table_query = 'CREATE TABLE IF NOT EXISTS ' + workerID + '( workerID VARCHAR(30), cond VARCHAR(1), action VARCHAR(50), score INT, access TIMESTAMP)'
	queryThis(new_table_query)
}

var addPlayer = function(workerID, condition){
	createTable(name) //make new table if it doesn't exist already
	queryThis('INSERT INTO ' + workerID + ' VALUES("' + workerID + '", "' + condition + '", "start experiment", 0, "' + getTimestamp() + '")')
}

var updatePlayer = function(workerID, condition, action, score){
	queryThis('INSERT INTO ' + workerID + ' VALUES("' + workerID + '", "' + condition + '", "' + action + '", ' + score + ', "' + getTimestamp() + '")')
}

module.exports = {
	updatePlayer	: updatePlayer,
	addPlayer		: addPlayer
}