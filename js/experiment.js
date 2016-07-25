var socket = io('/experiment-nsp');

socket.on('condition', function(cond){
	exp.condition = cond;
});

function param( param, use_referrer ) { 
	param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+param+"=([^&#]*)"; 
    var regex = new RegExp( regexS ); 
    var tmpURL = use_referrer ? document.referrer : window.location.href
    var results = regex.exec( tmpURL ); 
    console.log("param: " + param + ", URL: " + tmpURL)
    if( results == null ) { 
        return ""; 
    } else { 
        return results[1];    
    } 
}

function make_slides(f){
	var slides = {};
	
	slides.i0 = slide({
		name: "i0",
		start: function(){
			exp.startT = Date.now();
		}
	});

	slides.instructions = slide({
		name: "instructions",
		button: function(){
			exp.go()
		}
	});

	slides.login = slide({
		name: "login",
		start: function(){
			$(".redirecting").hide()
			$(".display_prompt").html("Please click the button below to be redirected to the game.")
		},
		button: function(){
			var destination = '/game.html?condition=' + exp.condition + '&assignmentId=' + exp.assignmentId + '&hitID=' + exp.hitId + '&workerId=' + exp.workerId + '&turkSubmitTo=' + exp.turkSubmitTo;
			$(".redirecting").show()
			setTimeout(function(){
				window.location.href = destination;
			}, 1000)
		}
	});

	return slides;
}

function init(){
	exp.condition;
	exp.system = {
		Browser : BrowserDetect.browser,
		OS : BrowserDetect.OS,
		screenH: screen.height,
		screenUH: exp.height,
		screenW: screen.width,
		screenUW: exp.width
    };
    exp.structure = ["i0", "instructions", "login"];
    exp.assignmentId = param("assignmentId", false);
    exp.hitId = param("hitId", false);
    exp.workerId = param("workerId", false);
    exp.turkSubmitTo = param("turkSubmitTo", false);
	console.log("assignmentId: " + exp.assignmentId + " - hitId: " + exp.hitId + " - workerId: " + exp.workerId + " - turkSubmitTo: " + exp.turkSubmitTo);
	exp.slides = make_slides(exp);

	exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

	$('.slide').hide(); //hide everything

	//make sure turkers have accepted HIT (or you're not in mturk)
	$("#start_button").click(function(){
		if(turk.previewMode){
			$("#mustaccept").show();
		}else{
			$("#start_button").click(function() {$("#mustaccept").show()});
			exp.go();
		};
	});
	exp.go();
};
