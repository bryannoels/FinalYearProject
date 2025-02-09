"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stockController_1 = require("../controllers/stockController");
const router = express_1.default.Router();
router.get('/info/:symbol', stockController_1.getStockData);
router.get('/profile/:symbol', stockController_1.getStockProfile);
router.get('/most-active', stockController_1.getTop10MostActiveStocks);
router.get('/analysis/:symbol', stockController_1.getAnalysis);
router.get('/historical/:symbol', stockController_1.getHistoricalData);
router.get('/forecast/:symbol', stockController_1.getForecastData);
router.get('/eps/:symbol', stockController_1.getEPSData);
router.get('/pe-ratio/:symbol', stockController_1.getPeRatioData);
router.get('/aaa-corporate-bond-yield', stockController_1.getAaaCorporateBondYield);
router.get('/search/:query', stockController_1.searchStock);
exports.default = router;
