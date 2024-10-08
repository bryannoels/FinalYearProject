const express = require('express');
const { getStockData, getTop10MostActiveStocks } = require('../controllers/stockController');

const router = express.Router();

router.get('/info/:symbol', getStockData);
router.get('/most-active', getTop10MostActiveStocks);

module.exports = router;
