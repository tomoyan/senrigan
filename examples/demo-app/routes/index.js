const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const senrigan = require('@senrigan/sdk-node');

router.get('/products', (req, res) => {
  senrigan.pulse({ file: 'demo-app/routes/index.js', functionName: 'GET /products' });
  shopController.getProducts(req, res);
});

router.post('/orders', (req, res) => {
  senrigan.pulse({ file: 'demo-app/routes/index.js', functionName: 'POST /orders' });
  shopController.createOrder(req, res);
});

module.exports = router;
