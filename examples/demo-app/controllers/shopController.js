const storeService = require('../services/storeService');
const senrigan = require('@senrigan/sdk-node');

async function getProducts(req, res) {
  senrigan.pulse({ file: 'demo-app/controllers/shopController.js', functionName: 'getProducts' });
  
  try {
    const products = await storeService.fetchInventory();
    
    // Simulate some local processing
    senrigan.pulse({ file: 'demo-app/controllers/shopController.js', functionName: 'formatProductsResponse' });
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function createOrder(req, res) {
  senrigan.pulse({ file: 'demo-app/controllers/shopController.js', functionName: 'createOrder' });
  
  try {
    const orderId = await storeService.processPayment(req.body);
    
    senrigan.pulse({ file: 'demo-app/controllers/shopController.js', functionName: 'dispatchConfirmationEmail' });
    
    res.json({ success: true, orderId });
  } catch (err) {
    res.status(400).json({ error: 'Payment failed' });
  }
}

module.exports = {
  getProducts,
  createOrder
};
