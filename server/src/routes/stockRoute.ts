import express from 'express';
import { 
  getStockData, 
  getTop10MostActiveStocks, 
  getAnalysis, 
  getHistoricalData, 
  getForecastData, 
  getEPSData, 
  getPeRatioData,
  getAaaCorporateBondYield 
} from '../controllers/stockController';

const router = express.Router();

router.get('/info/:symbol', getStockData);
router.get('/most-active', getTop10MostActiveStocks);
router.get('/analysis/:symbol', getAnalysis);
router.get('/historical/:symbol', getHistoricalData);
router.get('/forecast/:symbol', getForecastData);
router.get('/eps/:symbol', getEPSData);
router.get('/pe-ratio/:symbol', getPeRatioData);
router.get('/aaa-corporate-bond-yield', getAaaCorporateBondYield);

export default router;
