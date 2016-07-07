var getParam = function(param){
    var pageURL = decodeURIComponent(window.location.search.substring(1)),
        URLVariables = pageURL.split('&'),
        param_name

    for (var i = 0; i < URLVariables.length; i++){
        param_name = URLVariables[i].split('=')
        if(param_name[0] == param){
            return param_name[1] === undefined ? true : param_name[1]
        }
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

	slides.thanks = slide({
		name: "thanks",
		start:function(){
			console.log("End of survey reached.")
			console.log(exp.response)
			exp.data= {
         		"system" : exp.system,
         		"condition" : exp.condition,
         		"response" : exp.response,
          		"time_in_minutes" : 2 //configure this somehow
    		};
			setTimeout(function() {turk.submit(exp.data);}, 1000);
		}
	})

	return slides
}

function init(){
    exp.user = getParam('user')
    exp.condition = getParam('condition')
	exp.response = ''
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