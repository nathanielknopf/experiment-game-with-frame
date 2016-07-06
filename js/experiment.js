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

	slides.username = slide({
		name: "username",
		start: function(){
			$(".err").hide()
			$(".display_prompt").html("Please enter your username here.")
		},
		button: function(){
      		response = $("#text_response").val();
      		if (response.length == 0){
      			$(".err").show()
      		}else{
      			exp.user = response
      			exp.go()
      		}
		}
	})

	slides.gotogame = slide({
		name: "gotogame",
		start: function(){
			console.log("Press the button to be redirected to the game...")
		},
		button: function(){
			var destination = "http://cocolabpi.com/game.html?user=" + exp.user
			var proceed = window.confirm("Are you ready to be redirected to the game?")
			if (proceed){
				setTimeout(function(){
					window.location = destination
				}, 1000)
			}
		}
	})

	// slides.game = slide({
	// 	name: "game",
	// 	start: function(){
	// 		console.log("Should have loaded images and stuff...")
	// 	},
	// 	button: function(){
	// 		exp.go()
	// 	}
	// })

	slides.thanks = slide({
		name: "thanks",
		start: function(){
			console.log("End.")
			console.log(exp.user + " has completed the survey.")
		}
	})

	return slides
}

function init(){
    exp.user = null
	exp.condition = _.sample(["a", "b"])
	exp.system = {
		Browser : BrowserDetect.browser,
		OS : BrowserDetect.OS,
		screenH: screen.height,
		screenUH: exp.height,
		screenW: screen.width,
		screenUW: exp.width
    }
    exp.structure = ["i0", "instructions", "username", "gotogame", "thanks"]

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