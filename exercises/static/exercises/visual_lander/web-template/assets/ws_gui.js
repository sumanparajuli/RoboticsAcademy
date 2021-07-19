// Set the src of iframe tag
//document.getElementById("gzweb").setAttribute(
//	"src", "http://" + websocket_address + ":8080")

// To decode the image string we will receive from server
function decode_utf8(s){
    return decodeURIComponent(escape(s))
}

// Websocket and other variables for image display
var websocket_gui;

function declare_gui(websocket_address){
	websocket_gui = new WebSocket("ws://" + websocket_address + ":2303/");

	websocket_gui.onopen = function(event){
		radiConect.contentWindow.postMessage({connection: 'exercise', command: 'launch_level', level: '6'}, '*');
		if (websocket_code.readyState == 1) {
			alert("[open] Connection established!");
			radiConect.contentWindow.postMessage({connection: 'exercise', command: 'up'}, '*');
		}
	}

	websocket_gui.onclose = function(event){
		radiConect.contentWindow.postMessage({connection: 'exercise', command: 'down'}, '*');
		if(event.wasClean){
			alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
		}
		else{
			alert("[close] Connection closed!");
		}
	}

	// What to do when a message from server is received
	websocket_gui.onmessage = function(event){
		var operation = event.data.substring(0, 4);
		if(operation == "#gui"){
			// Parse the entire Object
			var data = JSON.parse(event.data.substring(4, ));

			// Parse the Image Data
			var image_data = JSON.parse(data.image),
				source = decode_utf8(image_data.image),
				shape = image_data.shape;

			if(source != ""){
				image.src = "data:image/jpeg;base64," + source;
				canvas.width = shape[1];
				canvas.height = shape[0];
			}

			// Send the Acknowledgment Message
			websocket_gui.send("#ack");
		}

		if(operation == "#gul"){
			// Parse the entire Object
			var data = JSON.parse(event.data.substring(4, ));

			// Parse the Image Data
			var image_data = JSON.parse(data.image),
				source = decode_utf8(image_data.image),
				shape = image_data.shape;

			if(source != ""){
				image_left.src = "data:image/jpeg;base64," + source;
				canvas_left.width = shape[1];
				canvas_left.height = shape[0];
			}

			// Send the Acknowledgment Message
			websocket_gui.send("#ack");
		}

	}
}

// Function to start car
var playcar_old_timestamp = 0;
function playcar(){
	if(playcar_old_timestamp == 0 || playcar_old_timestamp + 2000 < (new Date).getTime()){
	    var message = "#car" + document.getElementById('car').value;
	    console.log("Message sent: " + message);
	    websocket_gui.send(message);
	    playcar_old_timestamp = (new Date).getTime();
	}
}

// Function to stop car
var stopcar_old_timestamp = 0;
function stopcar(){
	if(stopcar_old_timestamp == 0 || stopcar_old_timestamp + 2000 < (new Date).getTime()){
	    var message = "#stp";
	    console.log("Message sent: " + message);
	    websocket_gui.send(message);
	    stopcar_old_timestamp = (new Date).getTime();
	}
}

// Function to reset car
var resetcar_old_timestamp = 0;
function resetcar(){
	if(resetcar_old_timestamp == 0 || resetcar_old_timestamp + 2000 < (new Date).getTime()){
	    var message = "#rst";
	    console.log("Message sent: " + message);
	    websocket_gui.send(message);
	    resetcar_old_timestamp = (new Date).getTime();
	}
}

var canvas = document.getElementById("gui_canvas_right"),
    context = canvas.getContext('2d');
    image = new Image();
var canvas_left = document.getElementById("gui_canvas_left"),
    context_left = canvas_left.getContext('2d')
    image_left = new Image();

// For image object
image.onload = function(){
    update_image();
}

// For image object
image_left.onload = function(){
    update_left_image();
}

// Request Animation Frame to remove the flickers
function update_image(){
	window.requestAnimationFrame(update_image);
	context.drawImage(image, 0, 0);
}

// Request Animation Frame to remove the flickers
function update_left_image(){
	window.requestAnimationFrame(update_left_image);
	context_left.drawImage(image_left, 0, 0);
}