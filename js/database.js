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

var table = 'players'

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

var addPlayer = function(name, ID){
	queryThis('INSERT INTO ' + table + ' VALUES("' + name + '", "' + ID + '", "empty", 0, "' + getTimestamp() + '")')
}

var updatePlayer = function(name, ID, rocks, apples){
	queryThis('INSERT INTO ' + table + 'VALUES("' + name + '", "' + ID + '", "' + rocks + '", ' + apples + ', ' + getTimestamp() + '")')
}

// var updatePlayer = function(ID, element, new_value){
// 	queryThis('UPDATE ' + table + ' SET ' + element + ' = ' + new_value + ' WHERE ID = "' + ID + '"')
// }

module.exports = {
	updatePlayer	: updatePlayer,
	addPlayer		: addPlayer
}