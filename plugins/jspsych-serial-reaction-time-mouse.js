/**
 * jspsych-serial-reaction-time
 * Josh de Leeuw
 *
 * plugin for running a serial reaction time task
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["serial-reaction-time-mouse"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'serial-reaction-time-mouse',
    description: '',
    parameters: {
      target: {
        type: jsPsych.plugins.parameterType.INT,
        array: true,
        default: undefined,
        no_function: false,
        description: ''
      },
      grid: {
        type: jsPsych.plugins.parameterType.BOOL,
        array: true,
        default: [[1,1,1,1]],
        no_function: false,
        description: ''
      },
      grid_square_size: {
        type: jsPsych.plugins.parameterType.INT,
        default: 100,
        no_function: false,
        description: ''
      },
      target_color: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "#999",
        no_function: false,
        description: ''
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: true,
        no_function: false,
        description: ''
      },
      pre_target_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: 0,
        no_function: false,
        description: ''
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: -1,
        no_function: false,
        description: ''
      },
      fade_duration: {
        type: jsPsych.plugins.parameterType.INT,
        default: -1,
        no_function: false,
        description: ''
      },
      allow_nontarget_responses: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false,
        no_function: false,
        description: ''
      }, 
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        default: '',
        no_function: false,
        description: ''
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    var startTime = -1;
    var response = {
      rt: -1,
      row: -1,
      column: -1
    }

    // display stimulus
    var stimulus = this.stimulus(trial.grid, trial.grid_square_size);
    display_element.innerHTML = stimulus;


		if(trial.pre_target_duration <= 0){
			showTarget();
		} else {
			jsPsych.pluginAPI.setTimeout(function(){
				showTarget();
			}, trial.pre_target_duration);
		}

		//show prompt if there is one
    if (trial.prompt !== "") {
      display_element.innerHTML += trial.prompt;
    }

		function showTarget(){
      var resp_targets;
      if(!trial.allow_nontarget_responses){
        resp_targets = [display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1])]
      } else {
        resp_targets = display_element.querySelectorAll('.jspsych-serial-reaction-time-stimulus-cell');
      }
      for(var i=0; i<resp_targets.length; i++){
        resp_targets[i].addEventListener('mousedown', function(e){
          if(startTime == -1){
            return;
          } else {
            var info = {}
            info.row = e.currentTarget.getAttribute('data-row');
            info.column = e.currentTarget.getAttribute('data-column');
            info.rt = Date.now() - startTime;
            after_response(info);
          }
        });
      }

      startTime = Date.now();

      if(trial.fade_duration == -1){
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).style.backgroundColor = trial.target_color;
      } else {
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).style.transition = "background-color "+trial.fade_duration;
        display_element.querySelector('#jspsych-serial-reaction-time-stimulus-cell-'+trial.target[0]+'-'+trial.target[1]).style.backgroundColor = trial.target_color;
      }

			if(trial.trial_duration > -1){
				jsPsych.pluginAPI.setTimeout(endTrial, trial.trial_duration);
			}

		}

    function endTrial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
				"grid": JSON.stringify(trial.grid),
				"target": JSON.stringify(trial.target),
        "response_row": response.row,
        "response_column": response.column,
        "correct": response.row == trial.target[0] && response.column == trial.target[1]
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);

    };

    // function to handle responses by the subject
    function after_response(info) {

			// only record first response
      response = response.rt == -1 ? info : response;

      if (trial.response_ends_trial) {
        endTrial();
      }
    };

  };

  plugin.stimulus = function(grid, square_size, target, target_color, labels) {
    var stimulus = "<div id='jspsych-serial-reaction-time-stimulus' style='margin:auto; display: table; table-layout: fixed; border-spacing:"+square_size/4+"px'>";
    for(var i=0; i<grid.length; i++){
      stimulus += "<div class='jspsych-serial-reaction-time-stimulus-row' style='display:table-row;'>";
      for(var j=0; j<grid[i].length; j++){
        var classname = 'jspsych-serial-reaction-time-stimulus-cell';

        stimulus += "<div class='"+classname+"' id='jspsych-serial-reaction-time-stimulus-cell-"+i+"-"+j+"' "+
          "data-row="+i+" data-column="+j+" "+
          "style='width:"+square_size+"px; height:"+square_size+"px; display:table-cell; vertical-align:middle; text-align: center; cursor: pointer; font-size:"+square_size/2+"px;";
        if(grid[i][j] == 1){
          stimulus += "border: 2px solid black;"
        }
        if(typeof target !== 'undefined' && target[0] == i && target[1] == j){
          stimulus += "background-color: "+target_color+";"
        }
        stimulus += "'>";
        if(typeof labels !=='undefined' && labels[i][j] !== false){
          stimulus += labels[i][j]
        }
        stimulus += "</div>";
      }
      stimulus += "</div>";
    }
    stimulus += "</div>";

    return stimulus
  }

  return plugin;
})();
