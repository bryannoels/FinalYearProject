const express = require('express');
const { getStockData, getTop10MostActiveStocks, getAnalysis, getVerdict } = require('../controllers/stockController');

const router = express.Router();

router.get('/info/:symbol', getStockData);
router.get('/most-active', getTop10MostActiveStocks);
router.get('/analysis/:symbol', getAnalysis);
router.get('/verdict/:symbol', getVerdict);

module.exports = router;
