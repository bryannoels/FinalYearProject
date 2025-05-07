import request from 'supertest';
import express, { Express, Request, Response } from 'express';

// Mock the controller functions with proper typing
const mockGetStockData = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetStockProfile = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetTopStocks = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetAnalysis = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetHistoricalData = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetForecastData = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetEPSData = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetPeRatioData = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetAaaCorporateBondYield = jest.fn((req: Request, res: Response) => res.json({}));
const mockSearchStock = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetBenjaminGrahamList = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetDCFValue = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetDDMValue = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetBenjaminGrahamValue = jest.fn((req: Request, res: Response) => res.json({}));
const mockGetIntrinsicValueList = jest.fn((req: Request, res: Response) => res.json({}));

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
  let app: Express;
  const testSymbol = 'AAPL';
  const testQuery = 'Apple';

  beforeAll(() => {
    app = express();
    app.use(express.json());
    const router = require('../../../routes/stockRoute').default;
    app.use('/stocks', router);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getStockData for /info/:symbol', async () => {
    const response = await request(app).get(`/stocks/info/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetStockData).toHaveBeenCalled();
    expect(mockGetStockData.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getStockProfile for /get-profile/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-profile/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetStockProfile).toHaveBeenCalled();
    expect(mockGetStockProfile.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getTopStocks for /get-top-stocks', async () => {
    const response = await request(app).get('/stocks/get-top-stocks');
    
    expect(response.status).toBe(200);
    expect(mockGetTopStocks).toHaveBeenCalled();
  });

  it('should call getAnalysis for /analysis/:symbol', async () => {
    const response = await request(app).get(`/stocks/analysis/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetAnalysis).toHaveBeenCalled();
    expect(mockGetAnalysis.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getHistoricalData for /get-historical-data/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-historical-data/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetHistoricalData).toHaveBeenCalled();
    expect(mockGetHistoricalData.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getForecastData for /get-forecast/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-forecast/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetForecastData).toHaveBeenCalled();
    expect(mockGetForecastData.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getEPSData for /get-eps/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-eps/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetEPSData).toHaveBeenCalled();
    expect(mockGetEPSData.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getPeRatioData for /get-pe-ratio/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-pe-ratio/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetPeRatioData).toHaveBeenCalled();
    expect(mockGetPeRatioData.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getAaaCorporateBondYield for /get-aaa-corp-bond-yield', async () => {
    const response = await request(app).get('/stocks/get-aaa-corp-bond-yield');
    
    expect(response.status).toBe(200);
    expect(mockGetAaaCorporateBondYield).toHaveBeenCalled();
  });

  it('should call searchStock for /search/:query', async () => {
    const response = await request(app).get(`/stocks/search/${testQuery}`);
    
    expect(response.status).toBe(200);
    expect(mockSearchStock).toHaveBeenCalled();
    expect(mockSearchStock.mock.calls[0][0].params.query).toBe(testQuery);
  });

  it('should call getBenjaminGrahamList for /get-benjamin-graham-list', async () => {
    const response = await request(app).get('/stocks/get-benjamin-graham-list');
    
    expect(response.status).toBe(200);
    expect(mockGetBenjaminGrahamList).toHaveBeenCalled();
  });

  it('should call getDCFValue for /get-dcf-value/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-dcf-value/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetDCFValue).toHaveBeenCalled();
    expect(mockGetDCFValue.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getDDMValue for /get-ddm-value/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-ddm-value/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetDDMValue).toHaveBeenCalled();
    expect(mockGetDDMValue.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getBenjaminGrahamValue for /get-benjamin-graham-value/:symbol', async () => {
    const response = await request(app).get(`/stocks/get-benjamin-graham-value/${testSymbol}`);
    
    expect(response.status).toBe(200);
    expect(mockGetBenjaminGrahamValue).toHaveBeenCalled();
    expect(mockGetBenjaminGrahamValue.mock.calls[0][0].params.symbol).toBe(testSymbol);
  });

  it('should call getIntrinsicValueList for /get-intrinsic-value-list', async () => {
    const response = await request(app).get('/stocks/get-intrinsic-value-list');
    
    expect(response.status).toBe(200);
    expect(mockGetIntrinsicValueList).toHaveBeenCalled();
  });
});