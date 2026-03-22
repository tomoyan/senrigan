const express = require('express');
const senrigan = require('@senrigan/sdk-node');
const routes = require('./routes');
const path = require('path');

// Initialize Senrigan to connect to the local Collector
senrigan.init({ url: 'ws://localhost:9000' });

const app = express();
app.use(express.json());

// Log the entry point
app.use((req, res, next) => {
  senrigan.pulse({
    file: 'demo-app/index.js',
    functionName: 'middleware:logger',
    metadata: { method: req.method, path: req.path }
  });
  next();
});

app.use('/api', routes);

app.listen(3000, () => {
  console.log('Demo App running on http://localhost:3000');
  console.log('Make requests to /api/products or /api/orders to send pulses to Senrigan!');
});
