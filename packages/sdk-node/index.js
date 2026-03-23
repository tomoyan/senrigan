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

function pulse(options = {}) {
  let { file, functionName, line, metadata = {} } = options;
  
  // Auto-capture stack trace for file and line if omitted
  if (!file || !line) {
    const stackLines = new Error().stack.split('\n');
    if (stackLines.length >= 3) {
      const callerLine = stackLines[2]; // 0 is Error, 1 is pulse(), 2 is caller
      // match formats like `at function (path:line:col)` or `at path:line:col`
      const match = callerLine.match(/\((.*):(\d+):(\d+)\)/) || callerLine.match(/at\s+(.*):(\d+):(\d+)/);
      if (match) {
        if (!file) {
          file = match[1];
          // attempt to make it relative to cwd
          if (process.cwd && file.includes(process.cwd())) {
            const path = require('path');
            file = file.replace(process.cwd() + path.sep, '').replace(process.cwd() + '/', '');
            file = file.replace(/\\/g, '/'); // normalize backslashes
          }
        }
        if (!line) line = match[2];
      }
    }
  }

  const payload = {
    file: file || 'unknown',
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
