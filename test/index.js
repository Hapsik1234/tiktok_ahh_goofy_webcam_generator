const { OBSWebSocket } = require('obs-websocket-js');  // Use named import for OBSWebSocket
const obs = new OBSWebSocket();

async function connectToOBS() {
  try {
    // Connect to OBS WebSocket server
    await obs.connect('ws://localhost:4455');  // OBS WebSocket default port is now 4455 in OBS 28+
    console.log('Connected to OBS');

    // Example: Set a new scene or video feed for the virtual camera
    await setTextSourceContent('texta', 'Hello, OBS!');

  } catch (error) {
    console.error('Failed to connect to OBS:', error);
  }
}


async function setTextSourceContent(sourceName, newText) {
  try {
    await obs.call('SetInputSettings', {
      inputName: sourceName,
      inputSettings: {
        text: newText
      }
    });
    console.log(`Text content updated to: "${newText}"`);
  } catch (error) {
    console.error('Failed to set text content:', error);
  }
}




connectToOBS();