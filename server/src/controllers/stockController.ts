import { Request, Response } from 'express';
import { spawn } from 'child_process';
import axios from 'axios';
import csv from "csv-parser";
import fs from "fs";
import Redis from 'ioredis';
import path from 'path';

type BenjaminGrahamData = {
  "Stock Symbol": string;
  "Company Name": string;
  "Defensive Value": number;
  "Defensive": string;
  "Enterprising Value": number;
  "Enterprising": string;
  "Overall Value": number;
};

const redis = new Redis();
const cacheDuration = 3600;

const cacheUtils = {
  async getFromCache(key: string): Promise<any | null> {
    const cachedData = await redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
  },

  async setInCache(key: string, data: any): Promise<void> {
    await redis.setex(key, cacheDuration, JSON.stringify(data));
  }
};

const executePythonScript = async (
  scriptPath: string, 
  args: string[], 
  res: Response, 
  cacheKey: string | null = null
): Promise<void> => {
  const pythonProcess = spawn('python3', [scriptPath, ...args]);
  
  pythonProcess.stdout.on('data', async (data) => {
    try {
      const parsedData = JSON.parse(data.toString());
      if (!res.headersSent) {
        if (cacheKey) {
          await cacheUtils.setInCache(cacheKey, parsedData);
        }
        res.json(parsedData);
      }
    } catch (error) {
      handleError(res, 'Failed to parse response');
    }
  });

  pythonProcess.stderr.on('data', () => {
    handleError(res, 'Error executing Python script');
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0 && !res.headersSent) {
      handleError(res, `Python script exited with code ${code}`);
    }
  });
};

const handleError = (res: Response, message: string, statusCode: number = 500): void => {
  if (!res.headersSent) {
    res.status(statusCode).json({ error: message });
  }
};

const createPythonScriptController = (scriptName: string, getCacheKey: (req: Request) => string) => {
  return async (req: Request, res: Response): Promise<void> => {
    const cacheKey = getCacheKey(req);
    
    const cachedData = await cacheUtils.getFromCache(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }
    
    let args: string[] = [];
    
    if (req.params.symbol) {
      args.push(req.params.symbol.toUpperCase());
    }
    
    if (scriptName === '../dataExtractor/stocks/getHistoricalData.py' && req.query.range) {
      args.push(req.query.range as string);
    }
    
    if (scriptName === '../dataExtractor/stocks/getTopStock.py' && req.query.category) {
      args.push(req.query.category as string);
    } else if (scriptName === '../dataExtractor/stocks/getTopStock.py') {
      args.push("most-active");
    }

    if (scriptName === '../dataExtractor/stocks/searchStock.py' && req.params.query) {
      args = [req.params.query.toUpperCase()];
    }
    
    await executePythonScript(scriptName, args, res, cacheKey);
  };
};

const stockControllers = {
  getStockData: createPythonScriptController(
    '../dataExtractor/stocks/getStockData.py',
    (req) => `stockData:${req.params.symbol.toUpperCase()}`
  ),
  
  getStockProfile: createPythonScriptController(
    '../dataExtractor/stocks/getStockProfile.py',
    (req) => `stockProfile:${req.params.symbol.toUpperCase()}`
  ),
  
  getTopStocks: async (req: Request, res: Response): Promise<void> => {
    const { category } = req.query;
    const validCategories = ["most-active", "trending", "gainers", "losers", "52-week-gainers", "52-week-losers"];
    const cacheKey = `topStocks:${category || 'most-active'}`;

    if (category && !validCategories.includes(category as string)) {
      handleError(res, "Invalid category parameter", 400);
      return;
    }

    const cachedData = await cacheUtils.getFromCache(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    await executePythonScript(
      '../dataExtractor/stocks/getTopStock.py',
      [category as string || "most-active"],
      res,
      cacheKey
    );
  },
  
  getAnalysis: createPythonScriptController(
    '../dataExtractor/stocks/getAnalysis.py',
    (req) => `stockAnalysis:${req.params.symbol.toUpperCase()}`
  ),
  
  getHistoricalData: createPythonScriptController(
    '../dataExtractor/stocks/getHistoricalData.py',
    (req) => `historicalData:${req.params.symbol.toUpperCase()}:${req.query.range || '1d'}`
  ),
  
  getForecastData: async (req: Request, res: Response): Promise<void> => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `forecastData:${stockSymbol}`;

    const cachedData = await cacheUtils.getFromCache(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }

    const url = `https://production.dataviz.cnn.io/quote/forecast/${stockSymbol}`;
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      'Accept': 'application/json'
    };

    try {
      const response = await axios.get(url, { headers });
      if (!res.headersSent) {
        await cacheUtils.setInCache(cacheKey, response.data[0]);
        res.json(response.data[0]);
      }
    } catch (error) {
      handleError(res, 'Failed to fetch forecast data');
    }
  },
  
  getEPSData: createPythonScriptController(
    '../dataExtractor/stocks/getEPSData.py',
    (req) => `epsData:${req.params.symbol.toUpperCase()}`
  ),
  
  getPeRatioData: createPythonScriptController(
    '../dataExtractor/stocks/getPeRatioData.py',
    (req) => `peRatio:${req.params.symbol.toUpperCase()}`
  ),
  
  getAaaCorporateBondYield: createPythonScriptController(
    '../dataExtractor/stocks/getAaaCorporateBondYield.py',
    () => 'AaaCorporateBondYield'
  ),
  
  searchStock: createPythonScriptController(
    '../dataExtractor/stocks/searchStock.py',
    (req) => `search:${req.params.query.toUpperCase()}`
  ),
  
  getBenjaminGrahamList: async (req: Request, res: Response): Promise<void> => {
    let { sortBy, filterBy, page = "1" } = req.query;
    
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = 10;
    
    if (!sortBy || !["Defensive", "Enterprising", "Overall"].includes(sortBy as string)) {
      sortBy = "Overall";
    }
      
    if (filterBy && typeof filterBy === "string" && (sortBy === "Defensive" || sortBy === "Enterprising")) {
      if (!/^[01]{7}$/.test(filterBy)) {
        handleError(res, "Invalid filterBy format", 400);
        return;
      }
    }

    const cacheKey = `benjaminGrahamList:${sortBy}:${filterBy || ""}:${pageNumber}`;
    const cachedData = await cacheUtils.getFromCache(cacheKey);
    if (cachedData) {
      res.json(cachedData);
      return;
    }
      
    try {
      let stockData: BenjaminGrahamData[] = [];
      await new Promise<void>((resolve, reject) => {
        const filePath = path.resolve(__dirname, '../../../dataExtractor/sp500/data.csv');
        fs.createReadStream(filePath)
          .pipe(csv())
          .on("data", (row) => {
            row["Defensive Value"] = parseInt(row["Defensive Value"], 10);
            row["Enterprising Value"] = parseInt(row["Enterprising Value"], 10);
            row["Overall Value"] = parseInt(row["Overall Value"], 10);
            stockData.push(row as BenjaminGrahamData);
          })
          .on("end", () => {
            resolve();
          })
          .on("error", (err) => {
            reject(err);
          });
      });
      
      if (filterBy && sortBy !== "Overall") {
        stockData = applyFilter(stockData, filterBy as string, sortBy as "Defensive" | "Enterprising");
      }
          
      const sortKey = `${sortBy} Value` as keyof BenjaminGrahamData;
      stockData.sort((a, b) => (b[sortKey] as number) - (a[sortKey] as number));
      
      const totalItems = stockData.length;
      const totalPages = Math.ceil(totalItems / pageSize);
    
      const validPageNumber = Math.max(1, Math.min(pageNumber, totalPages));
    
      const startIndex = (validPageNumber - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      
      const paginatedData = stockData.slice(startIndex, endIndex);

      const data = {
        data: paginatedData,
        pagination: {
          currentPage: validPageNumber,
          totalPages,
          pageSize,
          totalItems,
          hasNextPage: validPageNumber < totalPages,
          hasPreviousPage: validPageNumber > 1
        },
        retrievedAt: getCurrentTimeEDT()
      };

      await cacheUtils.setInCache(cacheKey, data);
      res.json(data);
    } catch (error) {
      handleError(res, "Failed to process CSV data");
    }
  },
  
  getDCFValue: createPythonScriptController(
    '../dataExtractor/stocks/getDCFValue.py',
    (req) => `dcfValue:${req.params.symbol.toUpperCase()}`
  ),
  
  getDDMValue: createPythonScriptController(
    '../dataExtractor/stocks/getDDMValue.py',
    (req) => `ddmValue:${req.params.symbol.toUpperCase()}`
  ),
  
  getBenjaminGrahamValue: createPythonScriptController(
    '../dataExtractor/stocks/getBenjaminGrahamValue.py',
    (req) => `benjaminGrahamValue:${req.params.symbol.toUpperCase()}`
  )
};

const applyFilter = (data: BenjaminGrahamData[], filterBy: string, type: "Defensive" | "Enterprising") => {
  return data.filter((row) => {
    const value = row[type];
    return filterBy.split("").every((bit, index) => bit === "0" || value[index] === "1");
  });
};

const getCurrentTimeEDT = () => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/New_York',
    timeZoneName: 'short'
  };

  return new Intl.DateTimeFormat('en-US', options).format(now);
};

export const stockControllerFactory = createPythonScriptController;
export default stockControllers;