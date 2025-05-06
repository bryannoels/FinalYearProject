import request from 'supertest';
import express, { Express } from 'express';
import router from '../../../routes/stockRoute';
import * as stockControllers from '../../../controllers/stockController';

// Declare mockControllers *outside* the jest.mock factory function
let mockControllers: { [key: string]: jest.Mock<any, any> }; // Explicit type for mockControllers

jest.mock('../../../controllers/stockController', () => {
  // Use a factory function, but don't declare a new variable
  const mock: { [key: string]: jest.Mock<any, any> } = { // Explicit type for mock
    getStockData: jest.fn(),
    getStockProfile: jest.fn(),
    getTopStocks: jest.fn(),
    getAnalysis: jest.fn(),
    getHistoricalData: jest.fn(),
    getForecastData: jest.fn(),
    getEPSData: jest.fn(),
    getPeRatioData: jest.fn(),
    getAaaCorporateBondYield: jest.fn(),
    searchStock: jest.fn(),
    getBenjaminGrahamList: jest.fn(),
    getDCFValue: jest.fn(),
    getDDMValue: jest.fn(),
    getBenjaminGrahamValue: jest.fn(),
    getIntrinsicValueList: jest.fn(),
  };
  return mock;
});

describe('Stock Routes', () => {
  let app: Express;

  beforeAll(() => {
    app = express();
    app.use('/stocks', router);
    // Assign the mocked functions to the 'mockControllers' variable
    mockControllers = stockControllers as any;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call getIntrinsicValueList for /get-intrinsic-value-list', async () => {
    mockControllers.getIntrinsicValueList.mockResolvedValue(undefined);

    await request(app).get('/stocks/get-intrinsic-value-list');
    expect(mockControllers.getIntrinsicValueList).toHaveBeenCalledTimes(1);
  });

  it('should call getStockData for /info/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getStockData.mockResolvedValue({});
    await request(app).get(`/stocks/info/${symbol}`);
    expect(mockControllers.getStockData).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getStockProfile for /get-profile/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getStockProfile.mockResolvedValue({});
    await request(app).get(`/stocks/get-profile/${symbol}`);
    expect(mockControllers.getStockProfile).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getTopStocks for /get-top-stocks', async () => {
    mockControllers.getTopStocks.mockResolvedValue([]);
    await request(app).get('/stocks/get-top-stocks');
    expect(mockControllers.getTopStocks).toHaveBeenCalled();
  });

  it('should call getAnalysis for /analysis/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getAnalysis.mockResolvedValue({});
    await request(app).get(`/stocks/analysis/${symbol}`);
    expect(mockControllers.getAnalysis).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getHistoricalData for /get-historical-data/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getHistoricalData.mockResolvedValue([]);
    await request(app).get(`/stocks/get-historical-data/${symbol}`);
    expect(mockControllers.getHistoricalData).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getForecastData for /get-forecast/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getForecastData.mockResolvedValue({});
    await request(app).get(`/stocks/get-forecast/${symbol}`);
    expect(mockControllers.getForecastData).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getEPSData for /get-eps/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getEPSData.mockResolvedValue({});
    await request(app).get(`/stocks/get-eps/${symbol}`);
    expect(mockControllers.getEPSData).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getPeRatioData for /get-pe-ratio/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getPeRatioData.mockResolvedValue({});
    await request(app).get(`/stocks/get-pe-ratio/${symbol}`);
    expect(mockControllers.getPeRatioData).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getAaaCorporateBondYield for /get-aaa-corp-bond-yield', async () => {
    mockControllers.getAaaCorporateBondYield.mockResolvedValue({});
    await request(app).get('/stocks/get-aaa-corp-bond-yield');
    expect(mockControllers.getAaaCorporateBondYield).toHaveBeenCalled();
  });

  it('should call searchStock for /search/:query', async () => {
    const query = 'AAPL';
    mockControllers.searchStock.mockResolvedValue([]);
    await request(app).get(`/stocks/search/${query}`);
    expect(mockControllers.searchStock).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getBenjaminGrahamList for /get-benjamin-graham-list', async () => {
    mockControllers.getBenjaminGrahamList.mockResolvedValue([]);
    await request(app).get('/stocks/get-benjamin-graham-list');
    expect(mockControllers.getBenjaminGrahamList).toHaveBeenCalled();
  });

  it('should call getDCFValue for /get-dcf-value/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getDCFValue.mockResolvedValue({});
    await request(app).get(`/stocks/get-dcf-value/${symbol}`);
    expect(mockControllers.getDCFValue).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getDDMValue for /get-ddm-value/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getDDMValue.mockResolvedValue({});
    await request(app).get(`/stocks/get-ddm-value/${symbol}`);
    expect(mockControllers.getDDMValue).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });

  it('should call getBenjaminGrahamValue for /get-benjamin-graham-value/:symbol', async () => {
    const symbol = 'AAPL';
    mockControllers.getBenjaminGrahamValue.mockResolvedValue({});
    await request(app).get(`/stocks/get-benjamin-graham-value/${symbol}`);
    expect(mockControllers.getBenjaminGrahamValue).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });
});
