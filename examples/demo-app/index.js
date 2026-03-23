const express = require('express');
const senrigan = require('@senrigan/sdk-node');
const routes = require('./routes');
const path = require('path');


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

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api', routes);

app.get('/api/echo', (req, res) => {
  senrigan.pulse({
    file: 'demo-app/api/echo',
    functionName: 'handleEcho',
    metadata: { text: req.query.text }
  });
  res.json({ success: true, text: req.query.text });
});

app.listen(3000, () => {
  console.log('Demo App running on http://localhost:3000');
  console.log('Make requests to /api/products or /api/orders to send pulses to Senrigan!');
});
