//Editor Part
var editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/python");

// running variable for psuedo decoupling
// Play/Pause from Reset
var frequency = "0";

//WebSocket for Code
var websocket_code;
function declare_code(websocket_address){
    websocket_code = new WebSocket("ws://" + websocket_address + ":1905/");

    websocket_code.onopen = function(event){
        if (!resetRequested)
        radiConect.contentWindow.postMessage({connection: 'exercise', command: 'launch_level', level: '5'}, '*');
		if (websocket_gui.readyState == 1) {
            if (!resetRequested) {
                alert("[open] Connection established!");
                radiConect.contentWindow.postMessage({connection: 'exercise', command: 'up'}, '*');
            }
            firstCodeSent = false;
		}        
		websocket_code.send("#ping");
    }
    websocket_code.onclose = function(event){
        // Check for hard reset (reboot exercise.py)
        if (resetRequested && ws_manager.readyState == 1) {
            console.log("retrying...")
            setTimeout(function () {
                declare_code(websocket_address);
            }, 500)
        }
        else {
            if(event.wasClean){
                alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
            }
            else{
                alert("[close] Connection closed!");
            }
        }
    }

    websocket_code.onmessage = function(event){
        var source_code = event.data;
        operation = source_code.substring(0, 5);
        console.log(event.data);
        if(operation == "#load"){
            editor.setValue(source_code.substring(5,));
        }
        else if(operation == "#freq"){
            var frequency_message = JSON.parse(source_code.substring(5,));
			// Parse GUI and Brain frequencies
			document.querySelector("#ideal_gui_frequency").value = frequency_message.gui;
			document.querySelector('#ideal_code_frequency').value = frequency_message.brain;
            // Parse real time factor
			document.querySelector('#real_time_factor').value = frequency_message.rtf;

            // Send the acknowledgment message along with frequency
            code_frequency = document.querySelector('#code_freq').value;
            gui_frequency = document.querySelector('#gui_freq').value;
            real_time_factor = document.querySelector('#real_time_factor').value;

            frequency_message = {"brain": code_frequency, "gui": gui_frequency};
            websocket_code.send("#freq" + JSON.stringify(frequency_message));
        }
        else if (operation == "#ping"){
            websocket_code.send("#ping");
        }
        else if (operation == "#exec") {
            if (firstCodeSent == false) {
                firstCodeSent = true;
                enablePlayPause(true);
            }
            toggleSubmitButton(true);
        }
    };
}

// Function that sends/submits the code!
// Function that sends/submits the code!
function submitCode(){
    try {
        // Get the code from editor and add headers
        var python_code = editor.getValue();
        python_code = "#code\n" + python_code

        websocket_code.send(python_code);
        console.log("Code Sent! Check terminal for more information!");
    }
	catch {
		alert("Connection must be established before sending the code.")
	}
}

// Function that send/submits an empty string
function stopCode(){
    var stop_code = "#code\n";
    console.log("Message sent!");
	websocket_code.send(stop_code);
}

function resumeBrain(){
    let message = "#play\n";
    console.log("Message sent!");
	websocket_code.send(message);
}

function stopBrain(){
    let message = "#stop\n";
    console.log("Message sent!");
	websocket_code.send(message);
}

function resetBrain(){
    let message = "#rest\n";
    console.log("Message sent!");
	websocket_code.send(message);
}

// Function to save the code
function saveCode(){
    // Get the code from editor and add header

    var python_code = editor.getValue();
    python_code = "#save" + python_code;
    console.log("Code Sent! Check terminal for more information!");
    websocket_code.send(python_code)
}

// Function to load the code
function loadCode(){
    // Send message to initiate load message
    var message = "#load";
    websocket_code.send(message);

}

// Function for range slider
function codefrequencyUpdate(vol) {
    document.querySelector('#code_frequency').value = vol;
}

// Function for range slider
function guifrequencyUpdate(vol) {
	document.querySelector('#gui_frequency').value = vol;
}