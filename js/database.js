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

var table = 'players' //this will go away soon

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

var createTable = function(name){
	var new_table_query = 'CREATE TABLE IF NOT EXISTS ' + name + '( name VARCHAR(30), ID VARCHAR(30), cond VARCHAR(1), pocket VARCHAR(10), apples INT, fishes INT, access TIMESTAMP)'
	queryThis(new_table_query)
}

var addPlayer = function(name, condition, ID){
	createTable(name) //make new table if it doesn't exist already
	queryThis('INSERT INTO ' + name + ' VALUES("' + name + '", "' + ID + '", "' + condition + '", "empty", 0, 0,"' + getTimestamp() + '")')
}

var updatePlayer = function(name, ID, condition, pocket, apples, fishes){
	queryThis('INSERT INTO ' + name + ' VALUES("' + name + '", "' + ID + '", "' + condition + '", "' + pocket + '", ' + apples + ', ' + fishes  + ', "' + getTimestamp() + '")')
}

module.exports = {
	updatePlayer	: updatePlayer,
	addPlayer		: addPlayer
}
