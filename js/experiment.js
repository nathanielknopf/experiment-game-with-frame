function param( param, use_referrer ) { 
	param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+param+"=([^&#]*)";
   // var regexS = "[\?&]"+param+"=([^&#]*)"; 
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

// var param = function(param, use_referrer){
// 	var params
// 	var url
// 	if(use_referrer){
// 		url = document.referrer
// 		params = url.split('?')[1].split('&')
// 		console.log(url + ":" + params)
// 	}else{
// 		url = window.location.href
// 		params = url.split('?')[1].split('&')
// 	}
// 	for (var i = 0; i < params.length; i++){
// 		this_param = params[i].split('=')
// 		if(param == this_param[0]){
// 			console.log("param: " + param + ", url: " + url)
// 			return (this_param[1] === undefined) ? true : this_param[1]
// 		}
// 	}
// }

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
			$(".err").hide()
			$(".display_prompt").html("Please enter your username, then click the continue button to be redirected to the game.")
		},
		button: function(){
			response = $("#text_response").val();
			if (response.length == 0){
				$(".err").show();
			}else{
				exp.user = response;
				var destination = '/game.html?user=' + exp.user + '&condition=' + exp.condition + '&assignmentId=' + exp.assignmentId + '&hitId=' + exp.hitId + '&workerId=' + exp.workerId + '&turkSubmitTo=' + exp.turkSubmitTo;
				var proceed = window.confirm("Are you ready to be redirected to the game?");
				if (proceed){
					setTimeout(function(){
						window.location.href = destination;
					}, 1000)
				};
			};
		}
	});

	return slides;
}

function init(){
	exp.condition = _.sample(["a", "b"]);
	exp.system = {
		Browser : BrowserDetect.browser,
		OS : BrowserDetect.OS,
		screenH: screen.height,
		screenUH: exp.height,
		screenW: screen.width,
		screenUW: exp.width
    };
    exp.structure = ["i0", "instructions", "login"];
    exp.assignmentId = param("assignmentId", true);
    exp.hitId = param("hitId", true);
    exp.workerId = param("workerId", true);
    exp.turkSubmitTo = param("turkSubmitTo");
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
