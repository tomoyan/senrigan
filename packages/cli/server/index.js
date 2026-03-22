const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const fs = require('fs');

function createServer(port, staticPath) {
  return new Promise((resolve, reject) => {
    const app = express();
    app.use(express.json());

    // Serve static dashboard files if they exist
    if (fs.existsSync(staticPath)) {
      app.use(express.static(staticPath));
    } else {
      app.get('/', (req, res) => {
        res.send('Senrigan Dashboard is not built yet. Run "npm run build" in the dashboard package.');
      });
    }

    const server = http.createServer(app);
    const wss = new WebSocketServer({ server });

    // Store connect dashboard clients
    const dashboardClients = new Set();

    wss.on('connection', (ws, req) => {
      const url = req.url || '/';
      
      // Determine if visualizer client or agent sdk
      if (url.includes('client=dashboard')) {
        dashboardClients.add(ws);
        ws.on('close', () => dashboardClients.delete(ws));
        ws.send(JSON.stringify({ type: 'welcome', message: 'Connected to Senrigan Collector' }));
      } else {
        // It's an Agent SDK connection
        ws.on('message', (message) => {
          try {
            const pulse = JSON.parse(message);
            // Broadcast pulse to all dashboards
            for (const client of dashboardClients) {
              if (client.readyState === 1 /* OPEN */) {
                client.send(JSON.stringify({ type: 'pulse', data: pulse }));
              }
            }
          } catch (e) {
            console.error('Failed to parse agent pulse:', e);
          }
        });
      }
    });

    server.on('error', (err) => {
      reject(err);
    });

    server.listen(port, () => {
      resolve({ port });
    });
  });
}

module.exports = createServer;
