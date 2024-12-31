const express = require('express');
const { getStockData, getTop10MostActiveStocks, getAnalysis, getVerdict, getHistoricalData, getForecastData, getEPSData, getAaaCorporateBondYield } = require('../controllers/stockController');

const router = express.Router();

router.get('/info/:symbol', getStockData);
router.get('/most-active', getTop10MostActiveStocks);
router.get('/analysis/:symbol', getAnalysis);
router.get('/verdict/:symbol', getVerdict);
router.get('/historical/:symbol', getHistoricalData);
router.get('/forecast/:symbol', getForecastData);
router.get('/eps/:symbol', getEPSData);
router.get('/aaa-corporate-bond-yield', getAaaCorporateBondYield);

module.exports = router;
