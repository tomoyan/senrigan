// Welcome to Senrigan!
// By using Node's preload flag (node -r ./senrigan.js), we can initialize 
// our background connection to the dashboard completely transparently without 
// ever modifying our actual application's main files.

const senrigan = require('@senrigan/sdk-node');

// Connect to the standalone Senrigan server running in the background
senrigan.init({ url: 'ws://localhost:9000' });
