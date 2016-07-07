function make_slides(f){
	var slides = {}

	slides.response = slide({
		name: "response",
		start: function(){
			exp.startT = Date.now()
			$(".err").hide()
			$(".prompt_one").html("Please describe small rocks.")
			$(".prompt_two").html("Please describe large rocks.")
		},
		button: function(){
			response_one = $("#response_one").val()
			response_two = $("#response_two").val()
			if(response_one.length == 0 || response_two.length == 0){
				$(".err.show").show()
			}else{
				exp.responses.small = response_one
				exp.responses.big = response_two
				exp.go()
			}
		}
	})

	slides.thanks = slide({
		name: "thanks",
		start:function(){
			console.log("End of survey reached.")
			console.log(exp.responses)
		}
	})

	return slides
}

function init(){
    exp.user = null
	// exp.condition = _.sample(["a", "b"])
	exp.responses = {}
	exp.system = {
		Browser : BrowserDetect.browser,
		OS : BrowserDetect.OS,
		screenH: screen.height,
		screenUH: exp.height,
		screenW: screen.width,
		screenUW: exp.width
    }
    exp.structure = ["response", "thanks"]

	exp.slides = make_slides(exp);

	exp.nQs = utils.get_exp_length(); //this does not work if there are stacks of stims (but does work for an experiment with this structure)
                    //relies on structure and slides being defined

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