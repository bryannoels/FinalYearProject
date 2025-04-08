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
exports.getBenjaminGrahamValue = exports.getDDMValue = exports.getDCFValue = exports.getBenjaminGrahamList = exports.searchStock = exports.getAaaCorporateBondYield = exports.getPeRatioData = exports.getEPSData = exports.getForecastData = exports.getHistoricalData = exports.getAnalysis = exports.getTopStocks = exports.getStockProfile = exports.getStockData = void 0;
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const ioredis_1 = __importDefault(require("ioredis"));
const redis = new ioredis_1.default();
const cacheDuration = 3600;
const getFromCache = (key) => __awaiter(void 0, void 0, void 0, function* () {
    const cachedData = yield redis.get(key);
    return cachedData ? JSON.parse(cachedData) : null;
});
const setInCache = (key, data) => __awaiter(void 0, void 0, void 0, function* () {
    yield redis.setex(key, cacheDuration, JSON.stringify(data));
});
const getStockData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `stockData:${stockSymbol}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        console.log("sending cached data");
        res.json(cachedData);
        return;
    }
    console.log("masuk");
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getStockData.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        console.log("masuk data");
        try {
            console.log(data);
            const stockData = JSON.parse(data.toString());
            if (!res.headersSent) {
                console.log("setting in cache");
                setInCache(cacheKey, stockData);
                res.json(stockData);
            }
        }
        catch (error) {
            console.log(error);
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
exports.getStockData = getStockData;
const getStockProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `stockProfile:${stockSymbol}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getStockProfile.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, stockData);
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
});
exports.getStockProfile = getStockProfile;
const getTopStocks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { category } = req.query;
    const validCategories = ["most-active", "trending", "gainers", "losers", "52-week-gainers", "52-week-losers"];
    const cacheKey = `topStocks:${category || 'most-active'}`;
    if (category && !validCategories.includes(category)) {
        res.status(400).json({ error: "Invalid category parameter" });
        return;
    }
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getTopStock.py', category || "most-active"]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stocksData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, stocksData);
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
});
exports.getTopStocks = getTopStocks;
const getAnalysis = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const stockSymbol = req.params.symbol.toUpperCase();
        const cacheKey = `stockAnalysis:${stockSymbol}`;
        const cachedData = yield getFromCache(cacheKey);
        if (cachedData) {
            res.json(cachedData);
            return;
        }
        const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getAnalysis.py', stockSymbol]);
        pythonProcess.stdout.on('data', (data) => {
            try {
                const analysisData = JSON.parse(data.toString());
                const verdict = analysisData.verdict;
                const num_of_buys = analysisData.number_of_buy;
                const num_of_holds = analysisData.number_of_hold;
                const num_of_sells = analysisData.number_of_sell;
                const ratings = analysisData.ratings;
                if (!res.headersSent) {
                    setInCache(cacheKey, { verdict, num_of_buys, num_of_holds, num_of_sells, ratings });
                    res.json({ verdict, num_of_buys, num_of_holds, num_of_sells, ratings });
                }
            }
            catch (error) {
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to parse response' });
                }
            }
        });
    }
    catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch verdict data' });
        }
    }
});
exports.getAnalysis = getAnalysis;
const getHistoricalData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const rangeParam = (req.query.range || '1d');
    const cacheKey = `historicalData:${stockSymbol}:${rangeParam}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getHistoricalData.py', stockSymbol, rangeParam]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const historicalData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, historicalData);
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
});
exports.getHistoricalData = getHistoricalData;
const getForecastData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `forecastData:${stockSymbol}`;
    const cachedData = yield getFromCache(cacheKey);
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
        const response = yield axios_1.default.get(url, { headers });
        if (!res.headersSent) {
            setInCache(cacheKey, response.data[0]);
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
const getEPSData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `epsData:${stockSymbol}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getEPSData.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const epsData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, epsData);
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
});
exports.getEPSData = getEPSData;
const getPeRatioData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `peRatio:${stockSymbol}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getPeRatioData.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const peRatioData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, peRatioData);
                res.json(peRatioData);
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
});
exports.getPeRatioData = getPeRatioData;
const getAaaCorporateBondYield = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cacheKey = `AaaCorporateBondYield`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getAaaCorporateBondYield.py']);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stocksData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, stocksData);
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
const searchStock = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.params.query.toUpperCase();
    const cacheKey = `seach:${query}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/searchStock.py', query]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, stockData);
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
});
exports.searchStock = searchStock;
const applyFilter = (data, filterBy, type) => {
    return data.filter((row) => {
        const value = row[type];
        return filterBy.split("").every((bit, index) => bit === "0" || value[index] === "1");
    });
};
const getBenjaminGrahamList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { sortBy, filterBy, page = "1" } = req.query;
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = 10;
    if (!sortBy || !["Defensive", "Enterprising", "Overall"].includes(sortBy)) {
        res.status(400).json({ error: "Invalid sortBy parameter" });
        return;
    }
    if (filterBy && typeof filterBy === "string" && (sortBy === "Defensive" || sortBy === "Enterprising")) {
        if (!/^[01]{7}$/.test(filterBy)) {
            res.status(400).json({ error: "Invalid filterBy format" });
            return;
        }
    }
    const cacheKey = `benjaminGrahamList:${sortBy}:${filterBy || ""}:${pageNumber}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    try {
        let stockData = [];
        yield new Promise((resolve, reject) => {
            fs_1.default.createReadStream("../sp500/data.csv")
                .pipe((0, csv_parser_1.default)())
                .on("data", (row) => {
                row["Defensive Value"] = parseInt(row["Defensive Value"], 10);
                row["Enterprising Value"] = parseInt(row["Enterprising Value"], 10);
                row["Overall Value"] = parseInt(row["Overall Value"], 10);
                stockData.push(row);
            })
                .on("end", () => {
                resolve();
            })
                .on("error", (err) => {
                reject(err);
            });
        });
        if (filterBy && sortBy !== "Overall") {
            stockData = applyFilter(stockData, filterBy, sortBy);
        }
        const sortKey = `${sortBy} Value`;
        stockData.sort((a, b) => b[sortKey] - a[sortKey]);
        const totalItems = stockData.length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const validPageNumber = Math.max(1, Math.min(pageNumber, totalPages));
        const startIndex = (validPageNumber - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, totalItems);
        const paginatedData = stockData.slice(startIndex, endIndex);
        const getCurrentTimeEDT = () => {
            const now = new Date();
            const options = {
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
        console.log(data);
        setInCache(cacheKey, data);
        res.json(data);
    }
    catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Failed to process CSV data" });
    }
});
exports.getBenjaminGrahamList = getBenjaminGrahamList;
const getDCFValue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `dcfValue:${stockSymbol}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getDCFValue.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const dcfData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, dcfData);
                res.json(dcfData);
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
});
exports.getDCFValue = getDCFValue;
const getDDMValue = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `ddmValue:${stockSymbol}`;
    const cachedData = yield getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getDDMValue.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const ddmData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, ddmData);
                res.json(ddmData);
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
});
exports.getDDMValue = getDDMValue;
const getBenjaminGrahamValue = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const cacheKey = `benjaminGrahamValue:${stockSymbol}`;
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
        res.json(cachedData);
        return;
    }
    const pythonProcess = (0, child_process_1.spawn)('python3', ['../dataExtractor/getBenjaminGrahamValue.py', stockSymbol]);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const bgData = JSON.parse(data.toString());
            if (!res.headersSent) {
                setInCache(cacheKey, bgData);
                res.json(bgData);
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
exports.getBenjaminGrahamValue = getBenjaminGrahamValue;
