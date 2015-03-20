$(document).ready(function() {

  // Record button click function
	
	$("#rec-btn").click(function(){
        alert ($(this).hasClass("rec-on").toString());
        $(this).removeClass( "rec-on" ).addClass( "rec-off" );
    });

});