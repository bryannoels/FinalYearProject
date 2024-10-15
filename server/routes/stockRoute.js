const express = require('express');
const { getStockData, getTop10MostActiveStocks, getAnalysis, getVerdict, getAnalystRatings, getHistoricalData, getEPSData } = require('../controllers/stockController');

const router = express.Router();

router.get('/info/:symbol', getStockData);
router.get('/most-active', getTop10MostActiveStocks);
router.get('/analysis/:symbol', getAnalysis);
router.get('/verdict/:symbol', getVerdict);
router.get('/analyst-ratings/:symbol', getAnalystRatings);
router.get('/historical/:symbol', getHistoricalData);
router.get('/eps/:symbol', getEPSData);


module.exports = router;
