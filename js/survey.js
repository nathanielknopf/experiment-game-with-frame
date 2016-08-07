// var socket = io('survey-nsp')

function param(param) { 
	param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+param+"=([^&#]*)"; 
    var regex = new RegExp( regexS ); 
    var tmpURL = window.location.href
    var results = regex.exec( tmpURL ); 
    console.log("param: " + param + ", URL: " + tmpURL)
    if( results == null ) { 
        return ""; 
    } else { 
        return results[1];    
    } 
}

function make_slides(f){
	var slides = {}

	slides.question_one = slide({
		name: "question_one",
		start: function(){
			$(".err").hide()
			var question = (exp.question_order == 'q1') ? exp.questions[0] : exp.questions[1]
			$(".prompt").html(question)
		},
		button: function(){
			response_one = $("#response_one").val()
			if(response_one.length == 0){
				$(".err").show()
			}else{
				exp.response_one = response_one
				var question = (exp.question_order == 'q1') ? exp.questions[0] : exp.questions[1]
				var response_packet = {workerId: exp.workerId, question: question, response: response_one}
				// socket.emit('response', response_packet)
				emitResponse(response_packet)
				exp.go()
			}
		}
	})

	slides.question_two = slide({
		name: "question_two",
		start: function(){
			$(".err").hide()
			var question = (exp.question_order == 'q1') ? exp.questions[1] : exp.questions[0]
			$(".prompt").html(question)
		},
		button: function(){
			response_two = $("#response_two").val()
			if(response_two.length == 0){
				$(".err").show()
			}else{
				exp.response_two = response_two
				var question = (exp.question_order == 'q1') ? exp.questions[1] : exp.questions[0]
				var response_packet = {workerId: exp.workerId, question: question, response: response_two}
				// socket.emit('response', response_packet)
				emitResponse(response_packet)
				exp.go()
			}
		}
	})

	slides.comprehension = slide({
		name: "comprehension",
		start: function(){
			$(".redirecting").hide()
			$(".display_prompt").html("In the next part of the survey, you will be given simple tasks in a world much like Lurekon. After you have attempted to completed each task, you will automatically be given the next one. When you have finished completing these tasks, the survey will end. Please click the button below to be redirected to the next part of the survey.")
		},
		button: function(){
			var destination = '/compgame.html?condition=' + exp.condition + '&qord=' + exp.question_order + '&assignmentId=' + exp.assignmentId + '&hitID=' + exp.hitId + '&workerId=' + exp.workerId + '&turkSubmitTo=' + exp.turkSubmitTo;
			$(".redirecting").show()
			setTimeout(function(){
				window.location.href = destination;
			}, 500)
		}
	})

	return slides
}

function init(){
	exp.questions = ["First question?", "Second question?"]
    exp.condition = (param('condition') == '') ? 'a' : param('condition')
    exp.question_order = (param('qord') == '') ? 'q1' : param('qord') //'q1' or 'q2'
	exp.response_one = ''
	exp.response_two = ''
	exp.assignmentId = param("assignmentId")
	exp.workerId = (param('workerId') == '') ? 'undefinedID' : param('workerId')
	exp.hitId = param("hitId")
	exp.turkSubmitTo = param("turkSubmitTo")
	exp.system = {
		Browser : BrowserDetect.browser,
		OS : BrowserDetect.OS,
		screenH: screen.height,
		screenUH: exp.height,
		screenW: screen.width,
		screenUW: exp.width
    }
    exp.structure = ["question_one", "question_two", "comprehension"]

	exp.slides = make_slides(exp);

	$('.slide').hide(); //hide everything

	//make sure turkers have accepted HIT (or you're not in mturk)
	$("#start_button").click(function(){
		if(turk.previewMode){
			$("#mustaccept").show()
		}else{
			$("#start_button").click(function() {$("#mustaccept").show()})
			exp.go()
		}
	})
	exp.go()
}