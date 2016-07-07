// var getParam = function(param){
//     var pageURL = decodeURIComponent(window.location.search.substring(1)),
//         URLVariables = pageURL.split('&'),
//         param_name

//     for (var i = 0; i < URLVariables.length; i++){
//         param_name = URLVariables[i].split('=')
//         if(param_name[0] == param){
//             return param_name[1] === undefined ? true : param_name[1]
//         }
//     }
// }

fs = require('fs')

function make_slides(f){
	var slides = {}
	
	slides.i0 = slide({
		name: "i0",
		start: function(){
			exp.startT = Date.now();
		}
	})

	slides.instructions = slide({
		name: "instructions",
		button: function(){
			exp.go()
		}
	})

	slides.login = slide({
		name: "login",
		start: function(){
			$(".err").hide()
			$(".display_prompt").html("Please enter your username, then click the continue button to be redirected to the game.")
		},
		button: function(){
			response = $("#text_response").val()
			if (response.length == 0){
				$(".err").show()
			}else{
				exp.user = response
				var destination = "http://cocolabpi.com/game.html?user=" + exp.user + '&condition=' + exp.condition
				var proceed = window.confirm("Are you ready to be redirected to the game?")
				if (proceed){
					setTimeout(function(){
						window.location = destination
					}, 1000)
				}
			}
		}
	})

	return slides
}

function init(){
	exp.condition = _.sample(["a", "b"])
	exp.system = {
		Browser : BrowserDetect.browser,
		OS : BrowserDetect.OS,
		screenH: screen.height,
		screenUH: exp.height,
		screenW: screen.width,
		screenUW: exp.width
    }
    exp.structure = ["i0", "instructions", "login"]

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