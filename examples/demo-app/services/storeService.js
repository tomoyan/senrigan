const senrigan = require('@senrigan/sdk-node');

async function fetchInventory() {
  senrigan.pulse({ file: 'demo-app/services/storeService.js', functionName: 'fetchInventory' });
  
  return new Promise((resolve) => {
    setTimeout(() => {
      senrigan.pulse({ file: 'demo-app/services/storeService.js', functionName: 'dbQueryComplete' });
      resolve([
        { id: 1, name: 'Senrigan Pro', price: 99 },
        { id: 2, name: 'Senrigan Lite', price: 0 }
      ]);
    }, 150);
  });
}

async function processPayment(paymentInfo) {
  senrigan.pulse({ file: 'demo-app/services/storeService.js', functionName: 'processPayment' });
  
  return new Promise((resolve) => {
    // Simulate contacting payment gateway
    setTimeout(() => {
      senrigan.pulse({ file: 'demo-app/services/storeService.js', functionName: 'verifyFraudRules' });
      
      setTimeout(() => {
        senrigan.pulse({ file: 'demo-app/services/storeService.js', functionName: 'paymentGatewaySuccess' });
        resolve(`ORD-${Math.floor(Math.random() * 10000)}`);
      }, 200);
      
    }, 100);
  });
}

module.exports = {
  fetchInventory,
  processPayment
};
