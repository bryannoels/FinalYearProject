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
exports.searchStock = exports.getAaaCorporateBondYield = exports.getPeRatioData = exports.getEPSData = exports.getForecastData = exports.getHistoricalData = exports.getAnalysis = exports.getTop10MostActiveStocks = exports.getStockProfile = exports.getStockData = void 0;
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const getStockData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getStockData.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stockData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving stock data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.getStockData = getStockData;
const getStockProfile = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getStockProfile.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stockData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving profile data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.getStockProfile = getStockProfile;
const getTop10MostActiveStocks = (req, res) => {
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getTopStock.py']);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stocksData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stocksData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', (data) => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving stock data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.getTop10MostActiveStocks = getTop10MostActiveStocks;
const getAnalysis = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getAnalysis.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const analysisData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(analysisData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving analysis data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.getAnalysis = getAnalysis;
const getHistoricalData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const rangeParam = (req.query.range || '1d');
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getHistoricalData.py', stockSymbol, rangeParam]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const historicalData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(historicalData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving historical data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.getHistoricalData = getHistoricalData;
const getForecastData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const url = `https://production.dataviz.cnn.io/quote/forecast/${stockSymbol}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'application/json'
    };
    try {
        const response = yield axios_1.default.get(url, { headers });
        if (!res.headersSent) {
            res.json(response.data[0]);
        }
    }
    catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch forecast data' });
        }
    }
});
exports.getForecastData = getForecastData;
const getEPSData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getEPSData.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const epsData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(epsData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving EPS data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.getEPSData = getEPSData;
const getPeRatioData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getPeRatioData.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const epsData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(epsData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving EPS data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.getPeRatioData = getPeRatioData;
const getAaaCorporateBondYield = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getAaaCorporateBondYield.py']);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stocksData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stocksData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving stock data' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
});
exports.getAaaCorporateBondYield = getAaaCorporateBondYield;
const searchStock = (req, res) => {
    const query = req.params.query.toUpperCase();
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/searchStock.py', query]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stockData);
            }
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ error: 'Failed to parse response' });
            }
        }
    });
    pythonProcess.stderr.on('data', () => {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Error retrieving the search result' });
        }
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};
exports.searchStock = searchStock;
