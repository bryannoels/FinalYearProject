import express from 'express';
import stockControllers from '../controllers/stockController';

const router = express.Router();

router.get('/info/:symbol', stockControllers.getStockData);
router.get('/get-profile/:symbol', stockControllers.getStockProfile);
router.get('/get-top-stocks', stockControllers.getTopStocks);
router.get('/analysis/:symbol', stockControllers.getAnalysis);
router.get('/get-historical-data/:symbol', stockControllers.getHistoricalData);
router.get('/get-forecast/:symbol', stockControllers.getForecastData);
router.get('/get-eps/:symbol', stockControllers.getEPSData);
router.get('/get-pe-ratio/:symbol', stockControllers.getPeRatioData);
router.get('/get-aaa-corp-bond-yield', stockControllers.getAaaCorporateBondYield);
router.get('/search/:query', stockControllers.searchStock);
router.get('/get-benjamin-graham-list', stockControllers.getBenjaminGrahamList);
router.get('/get-dcf-value/:symbol', stockControllers.getDCFValue);
router.get('/get-ddm-value/:symbol', stockControllers.getDDMValue);
router.get('/get-benjamin-graham-value/:symbol', stockControllers.getBenjaminGrahamValue);

export default router;