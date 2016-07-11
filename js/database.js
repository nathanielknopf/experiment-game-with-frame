var mysql = require('mysql')
var moment = require('moment')

var pool = mysql.createPool({
	connectionLimit	: 100,
	host			: 'localhost',
	user			: 'root',
	password		: 'cocolab',
	database		: 'game',
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
	var new_table_query = 'CREATE TABLE IF NOT EXISTS ' + name + '( name VARCHAR(30), ID VARCHAR(30), condition VARCHAR(1), rocks VARCHAR(10), apples INT, access TIMESTAMP)'
	queryThis(new_table_query)
}

var addPlayer = function(name, condition, ID){
	createTable(name) //make new table if it doesn't exist already
	queryThis('INSERT INTO ' + name + ' VALUES("' + name + '", "' + ID + '", "' + condition + '", "empty", 0, "' + getTimestamp() + '")')
}

var updatePlayer = function(name, ID, condition, rocks, apples){
	queryThis('INSERT INTO ' + name + ' VALUES("' + name + '", "' + ID + '", "' + condition + '", "' + rocks + '", ' + apples + ', "' + getTimestamp() + '")')
}

module.exports = {
	updatePlayer	: updatePlayer,
	addPlayer		: addPlayer
}
