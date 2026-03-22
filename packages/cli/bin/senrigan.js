#!/usr/bin/env node

const path = require('path');
const createServer = require('../server');

const args = process.argv.slice(2);
let port = 9000;

const portIndex = args.indexOf('--port');
if (portIndex !== -1 && args[portIndex + 1]) {
  port = parseInt(args[portIndex + 1], 10);
}

const dashboardPath = path.join(__dirname, '../../dashboard/dist');

createServer(port, dashboardPath)
  .then((serverInfo) => {
    console.log(`\n👁️ Senrigan Visualizer is running!`);
    console.log(`▶ Dashboard: http://localhost:${serverInfo.port}`);
    console.log(`▶ WebSocket: ws://localhost:${serverInfo.port}\n`);
    console.log(`Waiting for code movement pulses...`);
  })
  .catch((err) => {
    console.error('Failed to start Senrigan server:', err);
    process.exit(1);
  });
