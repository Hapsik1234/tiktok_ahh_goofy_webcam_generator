const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 }); // Create a WebSocket server on port 8080
const { OBSWebSocket } = require('obs-websocket-js');  // Use named import for OBSWebSocket
const obs = new OBSWebSocket();

var start = new Date().getTime();
var cleared = false;


async function connectToOBS() {
  try {
    // Connect to OBS WebSocket server
    await obs.connect('ws://localhost:4455');  // OBS WebSocket default port is now 4455 in OBS 28+
    console.log('Connected to OBS');

    // Example: Set a new scene or video feed for the virtual camera
    // await setTextSourceContent('texta', 'Hello, OBS!');

  } catch (error) {
    console.error('Failed to connect to OBS:', error);
  }
}

connectToOBS();


wss.on('connection', (ws) => {
  console.log('Client connected');
  
  var transcriptionFinalPart = "";
  var transcriptionIntermitPart = "";
  var entire;

  

  // var time;


  ws.on('message', (message) => { // Handling text fragment from client
	  
	parsed = JSON.parse(message);
	
    console.log('Received:', parsed);
	
	switch (parsed[0]) {
	
		case "f": // Got final fragment
			console.log("final");
			
			transcriptionFinalPart = parsed[1]; 
			transcriptionIntermitPart = "";
			
			break;
		case "i": // Got intermit fragment
		
			cleared = false;
		
			start = new Date().getTime();
			console.log("intermit");
			
			transcriptionIntermitPart = parsed[1];
			
			(async () => {
			  try {
				await obs.call('SetInputSettings', {
				  inputName: 'texta',  // Replace with your actual text source name in OBS
				  inputSettings: { text: transcriptionIntermitPart }
				});
				
				const sceneItem = await obs.call('GetSceneItemId', {
				  sceneName: 'AScene',  // Replace with the actual scene name in OBS
				  sourceName: 'texta'   // Replace with your actual text source name in OBS
				});
				
				await obs.call('SetSceneItemEnabled', {
				  sceneName: 'AScene',
				  sceneItemId: sceneItem.sceneItemId,
				  sceneItemEnabled: false  // Set to true to make it visible
				});
				
				await obs.call('SetSceneItemEnabled', {
				  sceneName: 'AScene',
				  sceneItemId: sceneItem.sceneItemId,
				  sceneItemEnabled: true  // Set to true to make it visible
				});
				
				
				console.log(`Updated OBS text to: "${transcriptionIntermitPart}"`);
			  } catch (error) {
				console.error('Error updating OBS text:', error);
			  }
			})();
			break;
			
			
			break;
		default:
			console.error(`Got ${parsed[0]}`);
			break;
	}
	
	
	entire = transcriptionFinalPart + transcriptionIntermitPart
	
	entire = entire.replace(/ {2,}/g, " "); // Deleting mysterious double spaces
	
	
	
	console.log(`Entire: ${entire}`);
	// console.log(`Last word said: ${time}`);
	
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

setInterval(() => {
	let time = new Date().getTime() - start; // Calculating the time that have elapsed from last word said
	if (time > 2000 && !cleared) {
		console.log("Clear");
		(async () => {
			try {
				await obs.call('SetSceneItemEnabled', {
				  sceneName: 'AScene',
				  sceneItemId: sceneItem.sceneItemId,
				  sceneItemEnabled: false  // Set to true to make it visible
				});
			} catch(error) {
				console.error(`Error with dsaasd: ${error}`);
			}
		
		});
		cleared = true;
	}
}, 50)


console.log('WebSocket server is running on ws://localhost:8080');