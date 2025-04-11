import request from 'supertest';
import express from 'express';
import stockControllers from '../../../controllers/stockController';
import Redis from 'ioredis';
import fs from 'fs';
import { spawn } from 'child_process';
import axios from 'axios';

jest.mock('ioredis');
jest.mock('child_process');
jest.mock('axios');
jest.mock('fs');

const MockRedis = Redis as jest.MockedClass<typeof Redis>;

interface MockStream {
  pipe: jest.Mock;
  on: jest.Mock;
}

interface SpawnMock {
  stdout: {
    on: jest.Mock;
  };
  stderr: {
    on: jest.Mock;
  };
  on: jest.Mock;
}

describe('Stock Controllers API Tests', () => {
  let app: express.Application;
  
  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    
    app.get('/api/stock/:symbol', stockControllers.getStockData);
    app.get('/api/stock/:symbol/profile', stockControllers.getStockProfile);
    app.get('/api/stock/top', stockControllers.getTopStocks);
    app.get('/api/stock/:symbol/analysis', stockControllers.getAnalysis);
    app.get('/api/stock/:symbol/historical', stockControllers.getHistoricalData);
    app.get('/api/stock/:symbol/forecast', stockControllers.getForecastData);
    app.get('/api/stock/:symbol/eps', stockControllers.getEPSData);
    app.get('/api/stock/:symbol/pe-ratio', stockControllers.getPeRatioData);
    app.get('/api/bond/aaa-corporate-yield', stockControllers.getAaaCorporateBondYield);
    app.get('/api/stock/search/:query', stockControllers.searchStock);
    app.get('/api/graham-list', stockControllers.getBenjaminGrahamList);
    app.get('/api/stock/:symbol/dcf', stockControllers.getDCFValue);
    app.get('/api/stock/:symbol/ddm', stockControllers.getDDMValue);
    app.get('/api/stock/:symbol/graham', stockControllers.getBenjaminGrahamValue);
  });

  describe('getStockData', () => {
    it('should return stock data from Python script', async () => {
      MockRedis.prototype.get = jest.fn().mockResolvedValue(null);
      
      const mockData = { ticker: 'AAPL', price: 150.25 };
      
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
      
      const response = await request(app).get('/api/stock/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getStockData.py', 'AAPL']);
    });
    
    it('should return cached data if available', async () => {
      const cachedData = { ticker: 'AAPL', price: 149.99 };
      MockRedis.prototype.get = jest.fn().mockResolvedValue(JSON.stringify(cachedData));
      
      const response = await request(app).get('/api/stock/AAPL');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(cachedData);
      expect(spawn).not.toHaveBeenCalled();
    });
  });

  describe('getTopStocks', () => {
    it('should return top stocks with category parameter', async () => {
      MockRedis.prototype.get = jest.fn().mockResolvedValue(null);
      
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
      
      const response = await request(app).get('/api/stock/top?category=gainers');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData);
      expect(spawn).toHaveBeenCalledWith('python3', ['../dataExtractor/stocks/getTopStock.py', 'gainers']);
    });
    
    it('should return error for invalid category', async () => {
      const response = await request(app).get('/api/stock/top?category=invalid-category');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('getForecastData', () => {
    it('should fetch forecast data from external API', async () => {
      MockRedis.prototype.get = jest.fn().mockResolvedValue(null);
      
      const mockData = [{ ticker: 'AAPL', forecast: { min: 150, max: 200 } }];
      (axios.get as jest.MockedFunction<typeof axios.get>).mockResolvedValue({ data: mockData });
      
      const response = await request(app).get('/api/stock/AAPL/forecast');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockData[0]);
      expect(axios.get).toHaveBeenCalledWith(
        'https://production.dataviz.cnn.io/quote/forecast/AAPL',
        expect.any(Object)
      );
    });
    
    it('should handle failed API requests', async () => {
      MockRedis.prototype.get = jest.fn().mockResolvedValue(null);
      
      (axios.get as jest.MockedFunction<typeof axios.get>).mockRejectedValue(new Error('API error'));
      
      const response = await request(app).get('/api/stock/AAPL/forecast');
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('getBenjaminGrahamList', () => {
    it('should return sorted and filtered Benjamin Graham list', async () => {
      MockRedis.prototype.get = jest.fn().mockResolvedValue(null);
      MockRedis.prototype.setex = jest.fn().mockResolvedValue('OK');
      
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
      
      const response = await request(app).get('/api/graham-list?sortBy=Overall&page=1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.data[0]['Stock Symbol']).toBe('MSFT');
    });
  });
});