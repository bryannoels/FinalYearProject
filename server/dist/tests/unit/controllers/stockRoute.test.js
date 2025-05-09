"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
// Mock the controller functions with proper typing
const mockGetStockData = jest.fn((req, res) => res.json({}));
const mockGetStockProfile = jest.fn((req, res) => res.json({}));
const mockGetTopStocks = jest.fn((req, res) => res.json({}));
const mockGetAnalysis = jest.fn((req, res) => res.json({}));
const mockGetHistoricalData = jest.fn((req, res) => res.json({}));
const mockGetForecastData = jest.fn((req, res) => res.json({}));
const mockGetEPSData = jest.fn((req, res) => res.json({}));
const mockGetPeRatioData = jest.fn((req, res) => res.json({}));
const mockGetAaaCorporateBondYield = jest.fn((req, res) => res.json({}));
const mockSearchStock = jest.fn((req, res) => res.json({}));
const mockGetBenjaminGrahamList = jest.fn((req, res) => res.json({}));
const mockGetDCFValue = jest.fn((req, res) => res.json({}));
const mockGetDDMValue = jest.fn((req, res) => res.json({}));
const mockGetBenjaminGrahamValue = jest.fn((req, res) => res.json({}));
const mockGetIntrinsicValueList = jest.fn((req, res) => res.json({}));
// Mock the controller module
jest.mock('../../../controllers/stockController', () => {
    return {
        getStockData: mockGetStockData,
        getStockProfile: mockGetStockProfile,
        getTopStocks: mockGetTopStocks,
        getAnalysis: mockGetAnalysis,
        getHistoricalData: mockGetHistoricalData,
        getForecastData: mockGetForecastData,
        getEPSData: mockGetEPSData,
        getPeRatioData: mockGetPeRatioData,
        getAaaCorporateBondYield: mockGetAaaCorporateBondYield,
        searchStock: mockSearchStock,
        getBenjaminGrahamList: mockGetBenjaminGrahamList,
        getDCFValue: mockGetDCFValue,
        getDDMValue: mockGetDDMValue,
        getBenjaminGrahamValue: mockGetBenjaminGrahamValue,
        getIntrinsicValueList: mockGetIntrinsicValueList,
    };
});
describe('Stock Routes', () => {
    let app;
    const testSymbol = 'AAPL';
    const testQuery = 'Apple';
    beforeAll(() => {
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        const router = require('../../../routes/stockRoute').default;
        app.use('/stocks', router);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should call getStockData for /info/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/info/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetStockData).toHaveBeenCalled();
        expect(mockGetStockData.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getStockProfile for /get-profile/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-profile/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetStockProfile).toHaveBeenCalled();
        expect(mockGetStockProfile.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getTopStocks for /get-top-stocks', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/stocks/get-top-stocks');
        expect(response.status).toBe(200);
        expect(mockGetTopStocks).toHaveBeenCalled();
    }));
    it('should call getAnalysis for /analysis/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/analysis/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetAnalysis).toHaveBeenCalled();
        expect(mockGetAnalysis.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getHistoricalData for /get-historical-data/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-historical-data/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetHistoricalData).toHaveBeenCalled();
        expect(mockGetHistoricalData.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getForecastData for /get-forecast/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-forecast/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetForecastData).toHaveBeenCalled();
        expect(mockGetForecastData.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getEPSData for /get-eps/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-eps/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetEPSData).toHaveBeenCalled();
        expect(mockGetEPSData.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getPeRatioData for /get-pe-ratio/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-pe-ratio/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetPeRatioData).toHaveBeenCalled();
        expect(mockGetPeRatioData.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getAaaCorporateBondYield for /get-aaa-corp-bond-yield', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/stocks/get-aaa-corp-bond-yield');
        expect(response.status).toBe(200);
        expect(mockGetAaaCorporateBondYield).toHaveBeenCalled();
    }));
    it('should call searchStock for /search/:query', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/search/${testQuery}`);
        expect(response.status).toBe(200);
        expect(mockSearchStock).toHaveBeenCalled();
        expect(mockSearchStock.mock.calls[0][0].params.query).toBe(testQuery);
    }));
    it('should call getBenjaminGrahamList for /get-benjamin-graham-list', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/stocks/get-benjamin-graham-list');
        expect(response.status).toBe(200);
        expect(mockGetBenjaminGrahamList).toHaveBeenCalled();
    }));
    it('should call getDCFValue for /get-dcf-value/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-dcf-value/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetDCFValue).toHaveBeenCalled();
        expect(mockGetDCFValue.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getDDMValue for /get-ddm-value/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-ddm-value/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetDDMValue).toHaveBeenCalled();
        expect(mockGetDDMValue.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getBenjaminGrahamValue for /get-benjamin-graham-value/:symbol', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get(`/stocks/get-benjamin-graham-value/${testSymbol}`);
        expect(response.status).toBe(200);
        expect(mockGetBenjaminGrahamValue).toHaveBeenCalled();
        expect(mockGetBenjaminGrahamValue.mock.calls[0][0].params.symbol).toBe(testSymbol);
    }));
    it('should call getIntrinsicValueList for /get-intrinsic-value-list', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/stocks/get-intrinsic-value-list');
        expect(response.status).toBe(200);
        expect(mockGetIntrinsicValueList).toHaveBeenCalled();
    }));
});
