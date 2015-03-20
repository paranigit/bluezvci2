'use strict';

$(document).ready(function() {
	
// Initialize Claim Process
  $("#watson").css('background-image','url(images/searching-gif1.gif');
  $("#rec-btn").css('background-image','url(images/mic-off.png');
  $("#watson-rec").hide();
  var claimProcess = "init";
  var mobileNumber = "";
  var mobileNumberPlus = "";
  var outStr = "";
  var micButton = $('#rec-btn'),
  	transcript = $('#watson-text'),
    micText = $('#rec-text');

    $('<p> Welcome to ABC Insurance claim processing center. Click on the start button to initiate your claim processing. </p>').appendTo(transcript);
  
  var audio = $('.speaker').get(0),
  	playing = false;
  audio.pause();
  audio.setAttribute('src','/synthesize?text=Welcome+to+ABC+Insurance+claim+processing+center.+Click+on+the+start+button+to+initiate+your+claim+processing.&voice=VoiceEnUsLisa');

  
  var startButton = $('#start-btn');
  
  startButton.click(function(){	  
	  var stBtnVal = $(this).attr('value');
	  
	  if (stBtnVal === "start") {			  
		  audio.pause();
		  transcript.empty();
		  $('<p> Please tell your 10 digit registered mobile number. Click on the microphone button before you start and click again when finished.</p>').appendTo(transcript);
		  audio.setAttribute('src','/synthesize?text=Please+tell+your+10+digit+registered+mobile+number.+Click+on+the+microphone+button+before+you+start+and+click+again+when+finished.&voice=VoiceEnUsLisa');
		  $(this).attr('value', 'reset');
		  $(this).text("Reset");
		  $("#watson-rec").show();		
		  claimProcess = "getmobile";
	  }	
	  
	  if (stBtnVal === "reset") {			  
		  audio.pause();
		  speech.stop();
		  transcript.empty();
		  micText.empty();
		  $("#watson").removeClass("watson-processing");
		  $('<p> Welcome to ABC Insurance claim processing center. Click on the start button to initiate your claim processing. </p>').appendTo(transcript);
		  audio.setAttribute('src','/synthesize?text=Welcome+to+ABC+Insurance+claim+processing+center.+Click+on+the+start+button+to+initiate+your+claim+processing.&voice=VoiceEnUsLisa');
		  $(this).attr('value', 'start');
		  $(this).text("Start");
		  $("#watson-rec").hide();	
		  claimProcess = "init";
		  mobileNumber = "";
		  mobileNumberPlus = "";
	  }
	  
  });
  
  
   	$('.speaker').on('playing', function() {
	   $("#watson").addClass("watson-processing");
	   playing = true;
	   console.log("audio playing.");
	   // disable button/link
	});
  
	$('.speaker').on('ended', function() {
	   $("#watson").removeClass("watson-processing");
	   playing = false;
	   console.log("audio ended.");
	   // enable button/link
	});
	
	
  $('.speaker').on('error', function () {
    $('.result').hide();
    $('.errorMgs').text('Error processing the request.');
    $('.errorMsg').css('color','red');
    $('.error').show();
  });

  $('.speaker').on('loadeddata', function () {
    $('.result').show();
    $('.error').hide();
  });

  

// Microphone Functions
 
  var recording = false,
  speech = new SpeechRecognizer({
    ws: '',
    model: 'WatsonModel'
  });
  
  speech.onstart = function() {
	  console.log('app-ready.onstart()');
	  recording = true;
	  transcript.empty();
	  $("#rec-btn").css('background-image','url(images/mic-on.png');
	  micText.text('REC ON - Click again when finished');
	  $("#watson").css('background-image','url(images/watson.gif');

	    // Clean the paragraphs
	    transcript.empty();
	    $('<p></p>').appendTo(transcript);
	};
	
	speech.onerror = function(error) {
	  console.log('app-ready.onerror():', error);
	};

	speech.onend = function() {
	  console.log('app-ready.onend()');
	  recording = false;
	  $("#rec-btn").css('background-image','url(images/mic-off.png');
	  $("#watson").css('background-image','url(images/searching-gif1.gif');
	  micText.text("REC off - Click to Start");
	};

	speech.onresult = function(data) {
	  console.log('app-ready.onresult()');
	  showResult(data);
	};
  
// Record button click
	micButton.click(function(){
		audio.pause();
		switch (claimProcess){
			case "getmobile":
				console.log("claim-process: get mobile number.");				
				startRecording(function(flag){
					if (flag === false){
						//alert ("text():" + transcript.text());						
					    outStr = convertTonumber(transcript.text());
						//outStr = convertTonumber("one two three.");
					    // alert("Outstr" + outStr);
					    transcript.empty();
					    mobileNumber =  outStr.replace(/\s/g, '');
					    mobileNumberPlus = outStr.replace(" ", "+");
					    $('<p> Registered mobile number you have given is ' + mobileNumber + '. If this is correct, say YES. Else click on the reset button to start again.</p>').appendTo(transcript);
					    audio.setAttribute('src','/synthesize?text=Registered+mobile+number+you+have+given+is+' + mobileNumberPlus  + '.+If+this+is+correct+say+yes.+Else+click+on+reset+button+to+start+again.&voice=VoiceEnUsLisa');
					    claimProcess = "confirmmobile";
					}
				
				});				
				break;
			case "confirmmobile":
				console.log("claim-process: confirm mobile number.");				
				startRecording(function(flag){
					if (flag === false){						
					    outStr = $.trim(transcript.text());
					    var strYes = {'Yes.':'Y','Ya.':'Y','Yes':'Y','Ya':'Y'};
					    var confirmStr = strYes[outStr];
					    if (confirmStr !== null & confirmStr !== undefined) {
					    	console.log("reading Policy Details");
					    	$.get("/readPolicy?mobileNo=" + mobileNumber, function(data, status){
					    		console.log(data);
						    	if (data !== null) {
						            transcript.empty();
						            var policyDet = {};
						            policyDet = data.toString().split(",");
						            if ($.trim(policyDet[1]) === "Active") {
						            	audio.setAttribute('src','/synthesize?text=Thank+you.+Your+policy+details+found.+Do+you+want+to+initiate+a+claim+process+now?+Say+YES+to+start.&voice=VoiceEnUsLisa');								    
								    	$('<h2>Policy Found..!</h2>').appendTo(transcript);
							            $('<p>Name: '+ policyDet[2] + '</p>').appendTo(transcript); 
							            $('<p>Policy No: '+ policyDet[0] + '</p>').appendTo(transcript);
							            $('<p>Status: '+ policyDet[1] + ' - Policy is eligible for a Claim now.</p>').appendTo(transcript);
							            $('<p>Do you want to initiate a claim process now? Say YES to start.</p>').appendTo(transcript);
							            claimProcess = "initiateclaim";							            
						            }
						            else {
						            	audio.setAttribute('src','/synthesize?text=Sorry.+Your+policy+is+not+active+and+you+can+not+raise+any+claims+against+this+policy.&voice=VoiceEnUsLisa');								    
							    	  	$('<h2>Oops..! Policy is not active. </h2>').appendTo(transcript);
							            $('<p>Name: '+ policyDet[2] + '</p>').appendTo(transcript); 
							            $('<p>Policy No: '+ policyDet[0] + '</p>').appendTo(transcript);
							            $('<p>Status: '+ policyDet[1] + ' - Policy is not eligible for a Claim.</p>').appendTo(transcript);
						            }	
						    	}
						    	else {
						    		transcript.empty();
						    		$('<p> Sorry..! We are unable to find any policy for the mobile number ' + mobileNumber +'. Please check and try again with correct number. Click on Reset.</p>').appendTo(transcript);
								    audio.setAttribute('src','/synthesize?text=Sorry.+We+are+unable+to+find+any+policy+for+the+mobile+number' + mobileNumberPlus  + '.+Please+check+and+try+again+with+correct+number.+Click+on+reset.&voice=VoiceEnUsLisa');								    
						    	}					            
					        });
					    	}
						}				
				});				
				break;
			case "initiateclaim":
				console.log("claim-process: initiate claim process.");				
				startRecording(function(flag){
					if (flag === false){						
					    outStr = $.trim(transcript.text());
					    var strYes = {'Yes.':'Y','Ya.':'Y','Yes':'Y','Ya':'Y'};
					    var confirmStr = strYes[outStr];
					    if (confirmStr !== null & confirmStr !== undefined) {
					    	 transcript.empty();
					    	 $('<h2>Initializing Claim processing..! </h2>').appendTo(transcript);
					    	}
						}				
				});				
				break;
		}
    });
	
	function showPolicyDetails(data) {
		console.log(data);
	}
	
	function startRecording(callback) {        
        if (!recording) {
        	recording = true;
        	audio.pause();
        	speech.start();        			
        	//recording = true;
            micText.text("Please wait..!");
        }
        else {
        	recording = false;
        	speech.stop();
            micText.text("Processing your speech");
            setTimeout(function(){callback(recording);},4000);            
        }        
	}
	
	function showResult(data,callback) {
	    //console.log(data);
	    //if there are transcripts
	    if (data.results && data.results.length > 0) {
	      //if is a partial transcripts
	      if (data.results.length === 1 ) {
	        var paragraph = transcript.children().last(),
	          text = data.results[0].alternatives[0].transcript || '';

	        //Capitalize first word
	        text = text.charAt(0).toUpperCase() + text.substring(1);
	        // if final results, append a new paragraph
	        if (data.results[0].final){
	          text = text.trim() + '. ';
	          $('<p></p>').appendTo(transcript);
	        }
	        paragraph.text(text);
	      }
	    }
	  }
	
	function convertTonumber(inString,outString) {
		var Small = {
		  'zero': 0,'Zero' : 0,'Zero.' : 0,'zero.' : 0,
		  'one': 1,'One' : 1,'One.' : 1,'one.' : 1,
		  'two': 2,'Two' : 2,'Two.' : 2,'two.' : 2,
		  'three': 3,'Three' : 3,'Three.' : 3,'three.' : 3,
		  'four': 4,'Four' : 4,'Four.' : 4,'four.' : 4,
		  'five': 5,'Five' : 5,'Five.' : 5,'five.' : 5,
		  'six': 6,'Six' : 6,'Six.' : 6,'six.' : 6,
		  'seven': 7,'Seven' : 7,'Seven.' : 7,'seven.' : 7,
		  'eight': 8,'Eight' : 8,'Eight.' : 8,'eight.' : 8,
		  'nine': 9,'Nine' : 9,'Nine.' : 9,'nine.' : 9,
		};

		var a, n, g;   

		 //alert(inString);
		 outString = text2num(inString);
		 return outString; 

		function text2num(s) {
		  a = s.toString().split(/[\s-]+/);
		  n = 0;
		   g = "";
		  a.forEach(feach);
		  return g;
		}

		function feach(w) {
		  var x = Small[w];
		  if (x !== null & x !== undefined) {
		      g = g + " " + x;
		  }
		}		
	}	
	
});