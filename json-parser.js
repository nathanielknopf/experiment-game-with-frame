var fs = require('fs');
var dirToRead = (process.argv[2]) ? (process.argv[2]) : './production-results';

fs.readdir(dirToRead, function(err, files){
	fs.writeFileSync('result-summary.txt', 'Results from experiment\n\n');
	files.forEach(function(JSONFileName, index, array){
		var data = require(dirToRead + '/' + JSONFileName);
		var toWrite = data.AssignmentId + ' -- ' + data.WorkerId + ' -- ' + data.AcceptTime + '\nSupplement: ' + data.answers.supplement + '\nScore: ' + data.answers.score;
		// toWrite += '\nSupplement: ' + data.answers.supplement;
		toWrite += '\nResponses: '
		for(var response in data.answers.responses){
			toWrite += '\nQuestion ' + (parseInt(response)+1).toString() + ': ' + data.answers.responses[response].response;
		}
		toWrite += '\nComprehension performance: '
		for(var object in data.answers.comprehension){
			toWrite += data.answers.comprehension[object].task + ': ' + data.answers.comprehension[object].actions[data.answers.comprehension[object].actions.length-1] + ', '
		}
		toWrite += '\n\n'
		fs.appendFileSync('result-summary.txt', toWrite)
	});
});
