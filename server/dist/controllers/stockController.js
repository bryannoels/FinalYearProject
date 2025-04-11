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
exports.stockControllerFactory = void 0;
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const ioredis_1 = __importDefault(require("ioredis"));
const path_1 = __importDefault(require("path"));
const redis = new ioredis_1.default();
const cacheDuration = 3600;
const cacheUtils = {
    getFromCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            const cachedData = yield redis.get(key);
            return cachedData ? JSON.parse(cachedData) : null;
        });
    },
    setInCache(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield redis.setex(key, cacheDuration, JSON.stringify(data));
        });
    }
};
const executePythonScript = (scriptPath_1, args_1, res_1, ...args_2) => __awaiter(void 0, [scriptPath_1, args_1, res_1, ...args_2], void 0, function* (scriptPath, args, res, cacheKey = null) {
    const pythonProcess = (0, child_process_1.spawn)('python3', [scriptPath, ...args]);
    pythonProcess.stdout.on('data', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const parsedData = JSON.parse(data.toString());
            if (!res.headersSent) {
                if (cacheKey) {
                    yield cacheUtils.setInCache(cacheKey, parsedData);
                }
                res.json(parsedData);
            }
        }
        catch (error) {
            handleError(res, 'Failed to parse response');
        }
    }));
    pythonProcess.stderr.on('data', () => {
        handleError(res, 'Error executing Python script');
    });
    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            handleError(res, `Python script exited with code ${code}`);
        }
    });
});
const handleError = (res, message, statusCode = 500) => {
    if (!res.headersSent) {
        res.status(statusCode).json({ error: message });
    }
};
const createPythonScriptController = (scriptName, getCacheKey) => {
    return (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const cacheKey = getCacheKey(req);
        const cachedData = yield cacheUtils.getFromCache(cacheKey);
        if (cachedData) {
            res.json(cachedData);
            return;
        }
        let args = [];
        if (req.params.symbol) {
            args.push(req.params.symbol.toUpperCase());
        }
        if (scriptName === '../dataExtractor/stocks/getHistoricalData.py' && req.query.range) {
            args.push(req.query.range);
        }
        if (scriptName === '../dataExtractor/stocks/getTopStock.py' && req.query.category) {
            args.push(req.query.category);
        }
        else if (scriptName === '../dataExtractor/stocks/getTopStock.py') {
            args.push("most-active");
        }
        if (scriptName === '../dataExtractor/stocks/searchStock.py' && req.params.query) {
            args = [req.params.query.toUpperCase()];
        }
        yield executePythonScript(scriptName, args, res, cacheKey);
    });
};
const stockControllers = {
    getStockData: createPythonScriptController('../dataExtractor/stocks/getStockData.py', (req) => `stockData:${req.params.symbol.toUpperCase()}`),
    getStockProfile: createPythonScriptController('../dataExtractor/stocks/getStockProfile.py', (req) => `stockProfile:${req.params.symbol.toUpperCase()}`),
    getTopStocks: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { category } = req.query;
        const validCategories = ["most-active", "trending", "gainers", "losers", "52-week-gainers", "52-week-losers"];
        const cacheKey = `topStocks:${category || 'most-active'}`;
        if (category && !validCategories.includes(category)) {
            handleError(res, "Invalid category parameter", 400);
            return;
        }
        const cachedData = yield cacheUtils.getFromCache(cacheKey);
        if (cachedData) {
            res.json(cachedData);
            return;
        }
        yield executePythonScript('../dataExtractor/stocks/getTopStock.py', [category || "most-active"], res, cacheKey);
    }),
    getAnalysis: createPythonScriptController('../dataExtractor/stocks/getAnalysis.py', (req) => `stockAnalysis:${req.params.symbol.toUpperCase()}`),
    getHistoricalData: createPythonScriptController('../dataExtractor/stocks/getHistoricalData.py', (req) => `historicalData:${req.params.symbol.toUpperCase()}:${req.query.range || '1d'}`),
    getForecastData: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const stockSymbol = req.params.symbol.toUpperCase();
        const cacheKey = `forecastData:${stockSymbol}`;
        const cachedData = yield cacheUtils.getFromCache(cacheKey);
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
                yield cacheUtils.setInCache(cacheKey, response.data[0]);
                res.json(response.data[0]);
            }
        }
        catch (error) {
            handleError(res, 'Failed to fetch forecast data');
        }
    }),
    getEPSData: createPythonScriptController('../dataExtractor/stocks/getEpsData.py', (req) => `epsData:${req.params.symbol.toUpperCase()}`),
    getPeRatioData: createPythonScriptController('../dataExtractor/stocks/getPeRatioData.py', (req) => `peRatio:${req.params.symbol.toUpperCase()}`),
    getAaaCorporateBondYield: createPythonScriptController('../dataExtractor/stocks/getAaaCorporateBondYield.py', () => 'AaaCorporateBondYield'),
    searchStock: createPythonScriptController('../dataExtractor/stocks/searchStock.py', (req) => `search:${req.params.query.toUpperCase()}`),
    getBenjaminGrahamList: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { sortBy, filterBy, page = "1" } = req.query;
        const pageNumber = parseInt(page, 10) || 1;
        const pageSize = 10;
        if (!sortBy || !["Defensive", "Enterprising", "Overall"].includes(sortBy)) {
            sortBy = "Overall";
        }
        if (filterBy && typeof filterBy === "string" && (sortBy === "Defensive" || sortBy === "Enterprising")) {
            if (!/^[01]{7}$/.test(filterBy)) {
                handleError(res, "Invalid filterBy format", 400);
                return;
            }
        }
        const cacheKey = `benjaminGrahamList:${sortBy}:${filterBy || ""}:${pageNumber}`;
        const cachedData = yield cacheUtils.getFromCache(cacheKey);
        if (cachedData) {
            res.json(cachedData);
            return;
        }
        try {
            let stockData = [];
            yield new Promise((resolve, reject) => {
                const filePath = path_1.default.resolve(__dirname, '../../../dataExtractor/sp500/data.csv');
                fs_1.default.createReadStream(filePath)
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
            yield cacheUtils.setInCache(cacheKey, data);
            res.json(data);
        }
        catch (error) {
            handleError(res, "Failed to process CSV data");
        }
    }),
    getDCFValue: createPythonScriptController('../dataExtractor/stocks/getDCFValue.py', (req) => `dcfValue:${req.params.symbol.toUpperCase()}`),
    getDDMValue: createPythonScriptController('../dataExtractor/stocks/getDDMValue.py', (req) => `ddmValue:${req.params.symbol.toUpperCase()}`),
    getBenjaminGrahamValue: createPythonScriptController('../dataExtractor/stocks/getBenjaminGrahamValue.py', (req) => `benjaminGrahamValue:${req.params.symbol.toUpperCase()}`)
};
const applyFilter = (data, filterBy, type) => {
    return data.filter((row) => {
        const value = row[type];
        return filterBy.split("").every((bit, index) => bit === "0" || value[index] === "1");
    });
};
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
exports.stockControllerFactory = createPythonScriptController;
exports.default = stockControllers;
