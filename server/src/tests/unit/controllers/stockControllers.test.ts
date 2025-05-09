const getFromCache = jest.fn<Promise<any>, [string]>();
const setInCache = jest.fn<Promise<void>, [string, any]>();
let mockConnect: jest.Mock;
let mockClient: any;

jest.mock('../../../utils/cacheUtils', () => ({
  createCacheUtils: (redisClient: Redis) => ({
    getFromCache,
    setInCache,
  }),
}));

import request from 'supertest';
import express from 'express';
import stockControllers, { sortAndFilterData, getNumber } from '../../../controllers/stockController';
import Redis from 'ioredis';
import fs from 'fs';
import { spawn } from 'child_process';
import axios from 'axios';
import { MongoClient } from 'mongodb';

jest.mock('ioredis');
jest.mock('child_process');
jest.mock('axios');
jest.mock('fs');
jest.mock('mongodb');


interface MockStream {
  pipe: jest.Mock;
  on: jest.Mock;
}

const mockRedisClient = {
  get: jest.fn(),
  setex: jest.fn(),
} as unknown as Redis;

(Redis as unknown as jest.Mock).mockImplementation(() => mockRedisClient);

jest.mock('mongodb', () => {
  const mockToArray = jest.fn();
  const mockFind = jest.fn().mockReturnValue({ toArray: mockToArray });
  const mockCollection = jest.fn().mockReturnValue({ find: mockFind });
  const mockDb = jest.fn().mockReturnValue({ collection: mockCollection });

  mockConnect = jest.fn();
  const mockClient = {
    connect: jest.fn(),
    db: mockDb,
    close: jest.fn(),
  };

  return {
    MongoClient: jest.fn(() => mockClient),
  };
});



const mockMongoData = [
  { ticker: 'AAPL', intrinsicValue: 150.25 },
  { ticker: 'GOOGL', intrinsicValue: 2800.75 },
];

const mockFind = jest.fn().mockReturnValue({
  toArray: jest.fn().mockResolvedValue(mockMongoData),
});


beforeEach(() => {
  jest.clearAllMocks();
});

describe('Stock Controllers API Tests', () => {
  let app: express.Application;
  
  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    
    app.get('/api/info/:symbol', stockControllers.getStockData);
    app.get('/api/get-profile/:symbol', stockControllers.getStockProfile);
    app.get('/api/get-top-stocks', stockControllers.getTopStocks);
    app.get('/api/analysis/:symbol', stockControllers.getAnalysis);
    app.get('/api/get-historical-data/:symbol', stockControllers.getHistoricalData);
    app.get('/api/get-forecast/:symbol', stockControllers.getForecastData);
    app.get('/api/get-eps/:symbol', stockControllers.getEPSData);
    app.get('/api/get-pe-ratio/:symbol', stockControllers.getPeRatioData);
    app.get('/api/get-aaa-corp-bond-yield', stockControllers.getAaaCorporateBondYield);
    app.get('/api/search/:query', stockControllers.searchStock);
    app.get('/api/get-benjamin-graham-list', stockControllers.getBenjaminGrahamList);
    app.get('/api/get-dcf-value/:symbol', stockControllers.getDCFValue);
    app.get('/api/get-ddm-value/:symbol', stockControllers.getDDMValue);
    app.get('/api/get-benjamin-graham-value/:symbol', stockControllers.getBenjaminGrahamValue);
    app.get('/api/get-intrinsic-value-list', stockControllers.getIntrinsicValueList);
  });

  describe('getStockData', () => {
    it('should return stock data from Python script', async () => {
      const mockData = { ticker: 'AAPL', price: 150.25 };
    
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
    
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              setTimeout(() => callback(Buffer.from(JSON.stringify(mockData))), 100);
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            setTimeout(() => callback(0), 200);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
    
      const response = await request(app).get('/api/info/AAPL');
    
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getStockData.py', 'AAPL']);
      expect(setInCache).toHaveBeenCalledWith('stockData:AAPL', mockData);
    });
    
    
    it('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', price: 150.25 };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/info/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });

    it('should handle errors from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'data') {
            callback(Buffer.from('Error executing Python script'));
          }
        })},
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/info/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error executing Python script');
    });
  });

  describe('getStockProfile', () => {
    it('should return stock profile data from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-profile/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getStockProfile.py', 'AAPL']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology' };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-profile/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });

    it('should handle errors from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'data') {
            callback(Buffer.from('Error executing Python script'));
          }
        })},
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-profile/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error executing Python script');
    });
  });

  describe('getTopStocks', () => {
    it('should return top stocks with category parameter', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = [{ ticker: 'AAPL' }, { ticker: 'MSFT' }];
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-top-stocks?category=gainers');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getTopStock.py', 'gainers']);
    });

    it('should return cached data if available', async () => {
      const cachedData = [{ ticker: 'AAPL' }, { ticker: 'MSFT' }];
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-top-stocks?category=gainers');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });

    it('should use default category "most-active" for cache key when no category is provided', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = [{ ticker: 'AAPL' }, { ticker: 'MSFT' }];
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-top-stocks?category');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getTopStock.py', 'most-active']);
    });

    it('should return error if category is invalid', async () => {
      const response = await request(app).get('/api/get-top-stocks?category=invalid-category');
      
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid category parameter');
    });

    it('should handle errors from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'data') {
            callback(Buffer.from('Error executing Python script'));
          }
        })},
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-top-stocks?category=gainers');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error executing Python script');
    });
    
  });

  describe('getAnalysis', () => {
    it('should return stock analysis data from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', recommendation: 'Buy', targetPrice: 180 };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/analysis/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getAnalysis.py', 'AAPL']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', recommendation: 'Buy', targetPrice: 180 };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/analysis/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });

    it('should handle errors from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'data') {
            callback(Buffer.from('Error executing Python script'));
          }
        })},
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/analysis/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error executing Python script');
    });
  });

  describe('getHistoricalData', () => {
    it('should return historical data with range parameter', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', data: [{ date: '2023-01-01', price: 150 }] };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-historical-data/AAPL?range=1y');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getHistoricalData.py', 'AAPL', '1y']);
    });

    it('should return historical data with range 1d when no range is given', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', data: [{ date: '2023-01-01', price: 150 }] };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-historical-data/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getHistoricalData.py', 'AAPL']);
    });

    it('should pass range parameter to Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', data: [] };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      await request(app).get('/api/get-historical-data/AAPL?range=5y');
      
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getHistoricalData.py', 'AAPL', '5y']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', data: [{ date: '2023-01-01', price: 150 }] };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-historical-data/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
  });

  describe('getForecastData', () => {
    it('should fetch forecast data from external API', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = [{ ticker: 'AAPL', forecast: { min: 150, max: 200 } }];
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockData });
      
      const response = await request(app).get('/api/get-forecast/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData[0]);
      expect(axios.get).toHaveBeenCalledWith(
        'https://production.dataviz.cnn.io/quote/forecast/AAPL',
        expect.any(Object)
      );
    });

    it('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', forecast: { min: 150, max: 200 } };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-forecast/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
    
    it('should handle failed API requests', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(new Error('API error'));
      
      const response = await request(app).get('/api/get-forecast/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 if no data is found from both API and cache', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({ data: null });
      
      const response = await request(app).get('/api/get-forecast/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error', 'Failed to fetch forecast data');
    });
  });

  describe('getEPSData', () => {
    it('should return EPS data from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', epsHistory: [{ year: 2022, eps: 6.11 }] };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-eps/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getEpsData.py', 'AAPL']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', epsHistory: [{ year: 2022, eps: 6.11 }] };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-eps/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });

    it('should handle errors from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'data') {
            callback(Buffer.from('Error executing Python script'));
          }
        })},
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-eps/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Error executing Python script');
    });
  });

  describe('getPeRatioData', () => {
    it('should return PE ratio data from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', peRatio: 25.4, industryAvg: 22.7 };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-pe-ratio/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getPeRatioData.py', 'AAPL']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', peRatio: 25.4, industryAvg: 22.7 };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-pe-ratio/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
  });

  describe('getAaaCorporateBondYield', () => {
    it('should return AAA corporate bond yield data from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { yield: 4.25, date: '2023-01-01' };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-aaa-corp-bond-yield');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getAaaCorporateBondYield.py']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { yield: 4.25, date: '2023-01-01' };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-aaa-corp-bond-yield');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
  });

  describe('searchStock', () => {
    it('should return search results from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'AAPB', name: 'Some Other Company' }
      ];
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/search/AAP');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/searchStock.py', 'AAP']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = [
        { symbol: 'AAPL', name: 'Apple Inc.' },
        { symbol: 'AAPB', name: 'Some Other Company' }
      ];
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/search/AAP');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
  });

  describe('getBenjaminGrahamList', () => {
    it('should return sorted and filtered Benjamin Graham list', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      Redis.prototype.setex = jest.fn().mockResolvedValue('OK');
      
      const mockCSVData = [
        { 
          'Stock Symbol': 'AAPL', 
          'Company Name': 'Apple Inc.', 
          'Defensive Value': '10', 
          'Defensive': '1111111', 
          'Enterprising Value': '5', 
          'Enterprising': '1110000', 
          'Overall Value': '15'
        },
        { 
          'Stock Symbol': 'MSFT', 
          'Company Name': 'Microsoft Corp.', 
          'Defensive Value': '9', 
          'Defensive': '1111110', 
          'Enterprising Value': '7', 
          'Enterprising': '1111000', 
          'Overall Value': '16'
        }
      ];
      
      const mockStream: MockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation(function(this: MockStream, event: string, callback: Function) {
          if (event === 'data') {
            mockCSVData.forEach(row => callback(row));
          }
          if (event === 'end') {
            callback();
          }
          return this;
        })
      };
      
      (fs.createReadStream as jest.MockedFunction<typeof fs.createReadStream>).mockReturnValue(mockStream as unknown as fs.ReadStream);
      
      const response = await request(app).get('/api/get-benjamin-graham-list?sortBy=Overall&page=1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data[0]['Stock Symbol']).toBe('MSFT');
    });
    
    it('should apply filter when filterBy parameter is provided', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      Redis.prototype.setex = jest.fn().mockResolvedValue('OK');
      
      const mockCSVData = [
        { 
          'Stock Symbol': 'AAPL', 
          'Company Name': 'Apple Inc.', 
          'Defensive Value': '10', 
          'Defensive': '1111111', 
          'Enterprising Value': '5', 
          'Enterprising': '1110000', 
          'Overall Value': '15'
        },
        { 
          'Stock Symbol': 'MSFT', 
          'Company Name': 'Microsoft Corp.', 
          'Defensive Value': '9', 
          'Defensive': '1111110', 
          'Enterprising Value': '7', 
          'Enterprising': '1111000', 
          'Overall Value': '16'
        }
      ];
      
      const mockStream: MockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation(function(this: MockStream, event: string, callback: Function) {
          if (event === 'data') {
            mockCSVData.forEach(row => callback(row));
          }
          if (event === 'end') {
            callback();
          }
          return this;
        })
      };
      
      (fs.createReadStream as jest.MockedFunction<typeof fs.createReadStream>).mockReturnValue(mockStream as unknown as fs.ReadStream);
      
      const response = await request(app).get('/api/get-benjamin-graham-list?sortBy=Defensive&filterBy=1110000');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should handle CSV read errors', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockStream: MockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation(function(this: MockStream, event: string, callback: Function) {
          if (event === 'error') {
            callback(new Error('CSV read error'));
          }
          return this;
        })
      };
      
      (fs.createReadStream as jest.MockedFunction<typeof fs.createReadStream>).mockReturnValue(mockStream as unknown as fs.ReadStream);
      
      const response = await request(app).get('/api/get-benjamin-graham-list');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to process CSV data');
    });
    
    it('should return default page when invalid page parameter provided', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      Redis.prototype.setex = jest.fn().mockResolvedValue('OK');
      
      const mockCSVData = [
        { 
          'Stock Symbol': 'AAPL', 
          'Company Name': 'Apple Inc.', 
          'Defensive Value': '10', 
          'Defensive': '1111111', 
          'Enterprising Value': '5', 
          'Enterprising': '1110000', 
          'Overall Value': '15'
        }
      ];
      
      const mockStream: MockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation(function(this: MockStream, event: string, callback: Function) {
          if (event === 'data') {
            mockCSVData.forEach(row => callback(row));
          }
          if (event === 'end') {
            callback();
          }
          return this;
        })
      };
      
      (fs.createReadStream as jest.MockedFunction<typeof fs.createReadStream>).mockReturnValue(mockStream as unknown as fs.ReadStream);
      
      const response = await request(app).get('/api/get-benjamin-graham-list?page=invalid');
      
      expect(response.status).toBe(200);
      expect(response.body.pagination.currentPage).toBe(1);
    });
    
    it('should handle invalid filterBy parameter format', async () => {
      const response = await request(app).get('/api/get-benjamin-graham-list?sortBy=Defensive&filterBy=invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid filterBy format');
    });

    it('should get cached data if available', async () => {
      const cachedData = { data: [{ ticker: 'AAPL' }], pagination: { currentPage: 1, totalPages: 1 } };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-benjamin-graham-list');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });

    it('should not apply filter if sortBy is not "Defensive" or "Enterprising"', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      Redis.prototype.setex = jest.fn().mockResolvedValue('OK');
      
      const mockCSVData = [
        { 
          'Stock Symbol': 'AAPL', 
          'Company Name': 'Apple Inc.', 
          'Defensive Value': '10', 
          'Defensive': '1111111', 
          'Enterprising Value': '5', 
          'Enterprising': '1110000', 
          'Overall Value': '15'
        },
        { 
          'Stock Symbol': 'MSFT', 
          'Company Name': 'Microsoft Corp.', 
          'Defensive Value': '9', 
          'Defensive': '1111110', 
          'Enterprising Value': '7', 
          'Enterprising': '1111000', 
          'Overall Value': '16'
        }
      ];
      
      const mockStream: MockStream = {
        pipe: jest.fn().mockReturnThis(),
        on: jest.fn().mockImplementation(function(this: MockStream, event: string, callback: Function) {
          if (event === 'data') {
            mockCSVData.forEach(row => callback(row));
          }
          if (event === 'end') {
            callback();
          }
          return this;
        })
      };
      
      (fs.createReadStream as jest.MockedFunction<typeof fs.createReadStream>).mockReturnValue(mockStream as unknown as fs.ReadStream);
      
      const response = await request(app).get('/api/get-benjamin-graham-list?sortBy=Overall&filterBy=1110000');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]['Stock Symbol']).toBe('MSFT');
    });
    
  });

  describe('getDCFValue', () => {
    it('should return DCF valuation from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', intrinsicValue: 180.25, currentPrice: 150.50 };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-dcf-value/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getDCFValue.py', 'AAPL']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', intrinsicValue: 180.25, currentPrice: 150.50 };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-dcf-value/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
  });

  describe('getDDMValue', () => {
    it('should return DDM valuation from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { ticker: 'AAPL', intrinsicValue: 175.30, currentPrice: 150.50 };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-ddm-value/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getDDMValue.py', 'AAPL']);
    });
    
    it ('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', intrinsicValue: 175.30, currentPrice: 150.50 };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-ddm-value/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
  });

  describe('getBenjaminGrahamValue', () => {
    it('should return Benjamin Graham valuation from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      const mockData = { 
        ticker: 'AAPL', 
        intrinsicValue: 165.75, 
        currentPrice: 150.50,
        defensiveCriteria: '1111110',
        enterprisingCriteria: '1110000' 
      };
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from(JSON.stringify(mockData)));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/get-benjamin-graham-value/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getBenjaminGrahamValue.py', 'AAPL']);
    });

    it ('should return cached data if available', async () => {
      const cachedData = { 
        ticker: 'AAPL', 
        intrinsicValue: 165.75, 
        currentPrice: 150.50,
        defensiveCriteria: '1111110',
        enterprisingCriteria: '1110000' 
      };
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();

      const response = await request(app).get('/api/get-benjamin-graham-value/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
    });
  });

  describe('Error Handling', () => {
    it('should handle Python script parsing errors', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from('Invalid JSON Data'));
            }
          })
        },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(0);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/info/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Failed to parse response');
    });

    it('should handle Python script execution errors', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { 
          on: jest.fn().mockImplementation((event: string, callback: Function) => {
            if (event === 'data') {
              callback(Buffer.from('Error in script execution'));
            }
          }) 
        },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(1);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/info/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Error executing Python script');
    });

    it('should handle non-zero exit codes from Python script', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
      
      (spawn as jest.MockedFunction<typeof spawn>).mockReturnValue({
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn().mockImplementation((event: string, callback: Function) => {
          if (event === 'close') {
            callback(2);
          }
        })
      } as unknown as ReturnType<typeof spawn>);
      
      const response = await request(app).get('/api/info/AAPL');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Python script exited with code 2');
    });
  });

  describe('getIntrinsicValueList', () => {
    it('should return intrinsic value list from cache if available', async () => {
      const cachedData = { data: [{ ticker: 'AAPL', intrinsicValue: 150.25 }], retrievedAt: new Date().toISOString() };
      
      getFromCache.mockResolvedValue(cachedData);
      setInCache.mockResolvedValue();
      
      const response = await request(app).get('/api/get-intrinsic-value-list');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
      expect(getFromCache).toHaveBeenCalledWith('intrinsicValueList:Overall Value:1');
      expect(mockConnect).not.toHaveBeenCalled();

    });
  
    it('should return an error if MongoDB connection fails', async () => {
      getFromCache.mockResolvedValue(null);
      setInCache.mockResolvedValue();
  
      mockConnect.mockRejectedValueOnce(new Error('MongoDB connection failed'));
  
      const response = await request(app).get('/api/get-intrinsic-value-list');
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Failed to fetch data from MongoDB');
    });

    it('should fetch from MongoDB, cache, and return sorted/filtered data', async () => {
      const mockMongoData = [
        { ticker: 'AAPL', intrinsicValue: 150 },
        { ticker: 'GOOGL', intrinsicValue: 2800 }
      ];
    
      (getFromCache as jest.Mock).mockResolvedValue(null);
      (setInCache as jest.Mock).mockResolvedValue(undefined);
    
      const mockToArray = jest.fn().mockResolvedValue(mockMongoData);
      const mockFind = jest.fn(() => ({ toArray: mockToArray }));
      const mockCollection = jest.fn(() => ({ find: mockFind }));
      const mockDb = jest.fn(() => ({ collection: mockCollection }));
      const mockConnect = jest.fn();
      const mockClose = jest.fn();
    
      const mockClient = {
        connect: mockConnect,
        db: mockDb,
        close: mockClose,
      };
    
      (MongoClient as unknown as jest.Mock).mockImplementation(() => mockClient);
    
      const response = await request(app).get('/api/get-intrinsic-value-list?sortBy=ticker&page=1');
    
      expect(response.status).toBe(200);
      expect(response.body).toEqual(expect.anything());
      expect(getFromCache).toHaveBeenCalledWith('intrinsicValueList:ticker:1');
      expect(setInCache).toHaveBeenCalledWith(
        'intrinsicValueList:ticker:1',
        expect.objectContaining({ data: mockMongoData })
      );
    });

  it ('should return cached data if available', async () => {
    const cachedData = { data: [{ ticker: 'AAPL', intrinsicValue: 150.25 }], retrievedAt: new Date().toISOString() };
    
    getFromCache.mockResolvedValue(cachedData);
    setInCache.mockResolvedValue();
    
    const response = await request(app).get('/api/get-intrinsic-value-list');
    
    expect(response.status).toBe(200);
    expect(response.body).toEqual(cachedData);
  });
});


describe('sortAndFilterData', () => {
  const mockData = [
    {
      'Stock Symbol': 'AAPL',
      'Company Name': 'Apple Inc.',
      'Beta': 1.2,
      'Opening Price': 145.3,
      'DCF Value': 130.0,
      'Percent DCF': 5.5,
      'Percent DDM': 3.2,
      'Percent Benjamin Graham': 5.7,
      'Percent Average': 3.1,
      'Percent Abs DCF': 6.3,
      'Percent Abs DDM': 2.1,
      'Percent Abs Benjamin Graham': 3.2,
      'Percent Abs Average': 8.4,
      'Intrinsic Value Standard Deviation': 5.0
    },
    {
      'Stock Symbol': 'GOOG',
      'Company Name': 'Google LLC',
      'Beta': 0.8,
      'Opening Price': 2721.0,
      'DCF Value': 2600.0,
      'Percent DCF': 3.0,
      'Percent DDM': 4.2,
      'Percent Benjamin Graham': 8.1,
      'Percent Average': 5.8,
      'Percent Abs DCF': 6.4,
      'Percent Abs DDM': 8.0,
      'Percent Abs Benjamin Graham': 1.5,
      'Percent Abs Average': 2.0,
      'Intrinsic Value Standard Deviation': 4.0
    },
    {
      'Stock Symbol': 'AMZN',
      'Company Name': 'Amazon.com Inc.',
      'Beta': 1.1,
      'Opening Price': 3450.5,
      'DCF Value': 3000.0,
      'Percent DCF': 8.3,
      'Percent DDM': 2.5,
      'Percent Benjamin Graham': 2.4,
      'Percent Average': 9.7,
      'Percent Abs DCF': 9.1,
      'Percent Abs DDM': 4.3,
      'Percent Abs Benjamin Graham': 6.3,
      'Percent Abs Average': 7.9,
      'Intrinsic Value Standard Deviation': 6.0
    }
  ];

  const formatted = { data: mockData, retrievedAt: new Date().toISOString() };

  it('should return data as is when sortBy is invalid or not provided', () => {
    const result = sortAndFilterData(formatted);

    expect(result.data).toEqual(mockData);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Beta field', () => {
    const result = sortAndFilterData(formatted, 'beta');

    expect(result.data[0]['Stock Symbol']).toBe('GOOG');
    expect(result.data[1]['Stock Symbol']).toBe('AMZN');
    expect(result.data[2]['Stock Symbol']).toBe('AAPL');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent DCF field', () => {
    const result = sortAndFilterData(formatted, 'percent_dcf');

    expect(result.data[0]['Stock Symbol']).toBe('GOOG');
    expect(result.data[1]['Stock Symbol']).toBe('AAPL');
    expect(result.data[2]['Stock Symbol']).toBe('AMZN');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent DDM field', () => {
    const result = sortAndFilterData(formatted, 'percent_ddm');

    expect(result.data[0]['Stock Symbol']).toBe('AMZN');
    expect(result.data[1]['Stock Symbol']).toBe('AAPL');
    expect(result.data[2]['Stock Symbol']).toBe('GOOG');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent Benjamin Graham field', () => {
    const result = sortAndFilterData(formatted, 'percent_graham');

    expect(result.data[0]['Stock Symbol']).toBe('AMZN');
    expect(result.data[1]['Stock Symbol']).toBe('AAPL');
    expect(result.data[2]['Stock Symbol']).toBe('GOOG');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent Average field', () => {
    const result = sortAndFilterData(formatted, 'percent_average');

    expect(result.data[0]['Stock Symbol']).toBe('AAPL');
    expect(result.data[1]['Stock Symbol']).toBe('GOOG');
    expect(result.data[2]['Stock Symbol']).toBe('AMZN');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent Abs DCF field', () => {
    const result = sortAndFilterData(formatted, 'percent_abs_dcf');

    expect(result.data[0]['Stock Symbol']).toBe('AAPL');
    expect(result.data[1]['Stock Symbol']).toBe('GOOG');
    expect(result.data[2]['Stock Symbol']).toBe('AMZN');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent Abs DDM field', () => {
    const result = sortAndFilterData(formatted, 'percent_abs_ddm');

    expect(result.data[0]['Stock Symbol']).toBe('AAPL');
    expect(result.data[1]['Stock Symbol']).toBe('AMZN');
    expect(result.data[2]['Stock Symbol']).toBe('GOOG');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent Abs Benjamin Graham field', () => {
    const result = sortAndFilterData(formatted, 'percent_abs_graham');

    expect(result.data[0]['Stock Symbol']).toBe('GOOG');
    expect(result.data[1]['Stock Symbol']).toBe('AAPL');
    expect(result.data[2]['Stock Symbol']).toBe('AMZN');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should sort and filter data by Percent Abs Average field', () => {
    const result = sortAndFilterData(formatted, 'percent_abs_average');

    expect(result.data[0]['Stock Symbol']).toBe('GOOG');
    expect(result.data[1]['Stock Symbol']).toBe('AMZN');
    expect(result.data[2]['Stock Symbol']).toBe('AAPL');
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should paginate data correctly for the first page', () => {
    const result = sortAndFilterData(formatted, 'beta', '1');

    expect(result.data.length).toBe(3);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should paginate data correctly for the second page', () => {
    const result = sortAndFilterData(formatted, 'beta', '2');

    expect(result.data.length).toBe(0);
    expect(result.currentPage).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.totalItems).toBe(3);
  });

  it('should filter out items with null or undefined field values when sorting by Beta', () => {
    const dataWithNull = [
      ...mockData,
      { 'Stock Symbol': 'TSLA', 'Company Name': 'Tesla', 'Beta': null, 'Opening Price': 950 }
    ];
    const formattedWithNull = { data: dataWithNull, retrievedAt: new Date().toISOString() };

    const result = sortAndFilterData(formattedWithNull, 'beta');

    expect(result.data.length).toBe(3);
  });

  it('should return an empty list if no items match the sort criteria', () => {
    const emptyData = [{ 'Stock Symbol': 'XYZ', 'Company Name': 'Test Inc.', 'Beta': null }];
    const formattedEmpty = { data: emptyData, retrievedAt: new Date().toISOString() };

    const result = sortAndFilterData(formattedEmpty, 'beta');

    expect(result.data).toEqual([]);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(0);
    expect(result.totalItems).toBe(0);
  });
});

describe('getNumber', () => {
  it('should return the number when provided a number', () => {
    expect(getNumber(5)).toBe(5);
    expect(getNumber(0)).toBe(0);
    expect(getNumber(-10)).toBe(-10);
    expect(getNumber(3.14)).toBe(3.14);
  });

  it('should parse and return a number from a numeric string', () => {
    expect(getNumber('42')).toBe(42);
    expect(getNumber('3.14')).toBe(3.14);
    expect(getNumber('-10')).toBe(-10);
    expect(getNumber('0')).toBe(0);
  });

  it('should parse and return a number from a string with percentage', () => {
    expect(getNumber('42%')).toBe(42);
    expect(getNumber('3.14%')).toBe(3.14);
    expect(getNumber('-10%')).toBe(-10);
  });

  it('should parse and return a number from a string with whitespace', () => {
    expect(getNumber(' 42 ')).toBe(42);
    expect(getNumber('  3.14  ')).toBe(3.14);
    expect(getNumber('\t-10\n')).toBe(-10);
  });

  it('should parse and return a number from a string with percentage and whitespace', () => {
    expect(getNumber(' 42% ')).toBe(42);
    expect(getNumber('  3.14%  ')).toBe(3.14);
    expect(getNumber('\t-10%\n')).toBe(-10);
  });

  it('should return null for non-numeric strings', () => {
    expect(getNumber('abc')).toBeNull();
    expect(getNumber('abc123')).toBeNull();
    expect(getNumber('')).toBeNull();
  });

  it('should return null for invalid inputs', () => {
    expect(getNumber(undefined as any)).toBeNull();
    expect(getNumber(null as any)).toBeNull();
    expect(getNumber({} as any)).toBeNull();
    expect(getNumber([] as any)).toBeNull();
  });
});

  
});