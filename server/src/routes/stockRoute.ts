import express from 'express';
import { 
  getStockData, 
  getStockProfile,
  getTopStocks, 
  getAnalysis, 
  getHistoricalData, 
  getForecastData, 
  getEPSData, 
  getPeRatioData,
  getAaaCorporateBondYield,
  searchStock,
  getBenjaminGrahamList
} from '../controllers/stockController';

const router = express.Router();

router.get('/info/:symbol', getStockData);
router.get('/get-profile/:symbol', getStockProfile);
router.get('/most-active', getTopStocks);
router.get('/analysis/:symbol', getAnalysis);
router.get('/get-historical-data/:symbol', getHistoricalData);
router.get('/get-forecast/:symbol', getForecastData);
router.get('/get-eps/:symbol', getEPSData);
router.get('/get-pe-ratio/:symbol', getPeRatioData);
router.get('/get-aaa-corp-bond-yield', getAaaCorporateBondYield);
router.get('/search/:query', searchStock);
router.get('/get-benjamin-graham-list', getBenjaminGrahamList);

export default router;
