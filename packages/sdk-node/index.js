const WebSocket = require('ws');

let ws = null;
let initUrl = null;
let isConnected = false;
let messageQueue = [];

function init({ url = 'ws://localhost:9000' } = {}) {
  initUrl = url;
  connect();
}

function connect() {
  if (ws) {
    ws.removeAllListeners();
  }
  
  ws = new WebSocket(initUrl);
  
  ws.on('open', () => {
    isConnected = true;
    // Flush queued pulses that happened before connection
    while(messageQueue.length > 0) {
      const msg = messageQueue.shift();
      ws.send(JSON.stringify(msg));
    }
  });
  
  ws.on('close', () => {
    isConnected = false;
    // Attempt to reconnect silently
    setTimeout(connect, 2000);
  });

  ws.on('error', () => {
    isConnected = false;
    // Silent fail to not crash the host application
  });
}

function pulse({ file, functionName, line, metadata = {} }) {
  const payload = {
    file,
    functionName,
    line,
    metadata,
    timestamp: Date.now()
  };
  
  if (isConnected && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
  } else {
    // Queue up to 1000 messages to prevent memory leaks if disconnected
    if (messageQueue.length < 1000) {
      messageQueue.push(payload);
    }
  }
}

module.exports = {
  init,
  pulse
};
