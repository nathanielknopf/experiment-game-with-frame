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
	var slides = {}

	slides.response = slide({
		name: "response",
		start: function(){
			exp.startT = Date.now()
			$(".err").hide()
			$(".prompt_one").html("You've just explored this world. Now, tell the next Turker things about this world that you think would help them.")
		},
		button: function(){
			response_one = $("#response_one").val()
			if(response_one.length == 0){
				$(".err.show").show()
			}else{
				exp.response = response_one
				exp.go()
			}
		}
	})

	slides.subj_info = slide({
		name: "subj_info",
		submit: function(e){
			exp.subj_data = {
				language: $("#language").val(),
				enjoyment: $("#enjoyment").val(),
				assess: $('input[name="assess"]:checked').val(),
				age: $("#age").val(),
				gender: $("#gender").val(),
				education: $("#education").val(),
				comments: $("#comments").val(),
			}
			exp.go()
		}
	})

	slides.thanks = slide({
		name: "thanks",
		start:function(){
			console.log("End of survey reached.")
			console.log(exp.response)
			exp.data= {
         		"system" : exp.system,
         		"condition" : exp.condition,
         		"response" : exp.response,
         		"subject_information": exp.subj_data
          		// "time_in_minutes" : configure this somehow
    		};
			setTimeout(function() {
				turk.submit(exp.data);
				setTimeout(function(){
					var destination = '/thanks.html?workerId=' + exp.user
					window.location.href = destination
				}, 1000)
				window.location.href = destination;
			}, 1000)
		}
	})

	return slides
}

function init(){
    exp.user = param('workerId', false)
    exp.condition = param('condition', false)
	exp.response = ''
	exp.system = {
		Browser : BrowserDetect.browser,
		OS : BrowserDetect.OS,
		screenH: screen.height,
		screenUH: exp.height,
		screenW: screen.width,
		screenUW: exp.width
    }
    exp.structure = ["response", "subj_info", "thanks"]

	exp.slides = make_slides(exp);

	// exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
 //                    //relies on structure and slides being defined

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