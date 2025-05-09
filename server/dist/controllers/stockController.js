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
exports.stockControllerFactory = exports.sortAndFilterData = exports.getNumber = void 0;
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongodb_1 = require("mongodb");
const cacheUtils_1 = require("../utils/cacheUtils");
const ioredis_1 = __importDefault(require("ioredis"));
const redisClient = new ioredis_1.default();
const { getFromCache, setInCache, clearAllCache, deleteCacheByKey } = (0, cacheUtils_1.createCacheUtils)(redisClient);
const getNumber = (value) => {
    if (typeof value === 'number')
        return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value.replace('%', '').trim());
        return isNaN(parsed) ? null : parsed;
    }
    return null;
};
exports.getNumber = getNumber;
const executePythonScript = (scriptPath, args, res, cacheKey) => __awaiter(void 0, void 0, void 0, function* () {
    const pythonProcess = (0, child_process_1.spawn)('python3', [scriptPath, ...args]);
    pythonProcess.stdout.on('data', (data) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const parsedData = JSON.parse(data.toString());
            if (!res.headersSent) {
                if (cacheKey) {
                    yield setInCache(cacheKey, parsedData);
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
        const cachedData = yield getFromCache(cacheKey);
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
        if (scriptName === '../dataExtractor/stocks/searchStock.py' && req.params.query) {
            args = [req.params.query.toUpperCase()];
        }
        yield executePythonScript(scriptName, args, res, cacheKey);
    });
};
const sortAndFilterData = (formatted, sortBy, pageParam) => {
    const config = {
        beta: {
            field: 'Beta',
            returnFields: ['Stock Symbol', 'Company Name', 'Beta', 'Opening Price'],
            filter: (item) => item.Beta !== null && item.Beta !== undefined
        },
        percent_dcf: {
            field: 'Percent DCF',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'DCF Value', 'Percent DCF'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent DCF']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        percent_ddm: {
            field: 'Percent DDM',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'DDM Value', 'Percent DDM'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent DDM']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        percent_graham: {
            field: 'Percent Benjamin Graham',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'Benjamin Graham Value', 'Percent Benjamin Graham'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent Benjamin Graham']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        percent_average: {
            field: 'Percent Average',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'Average Value', 'Percent Average'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent Average']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        percent_abs_dcf: {
            field: 'Percent Abs DCF',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'DCF Value', 'Percent Abs DCF'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent Abs DCF']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        percent_abs_ddm: {
            field: 'Percent Abs DDM',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'DDM Value', 'Percent Abs DDM'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent Abs DDM']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        percent_abs_graham: {
            field: 'Percent Abs Benjamin Graham',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'Benjamin Graham Value', 'Percent Abs Benjamin Graham'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent Abs Benjamin Graham']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        percent_abs_average: {
            field: 'Percent Abs Average',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'Average Value', 'Percent Abs Average'],
            filter: (item) => {
                const num = (0, exports.getNumber)(item['Percent Abs Average']);
                return num !== null && num >= -10 && num <= 10;
            }
        },
        stddev: {
            field: 'Intrinsic Value Standard Deviation',
            returnFields: ['Stock Symbol', 'Company Name', 'Opening Price', 'Intrinsic Value Standard Deviation']
        }
    };
    const sortOption = config[sortBy || ''];
    const filtered = formatted.data
        .filter(item => {
        if (!sortOption) {
            return Object.keys(item).some(key => item[key] !== null && item[key] !== undefined);
        }
        return item[sortOption.field] !== null && item[sortOption.field] !== undefined;
    })
        .map(item => {
        const filteredItem = {};
        const returnFields = sortOption ? sortOption.returnFields : Object.keys(item);
        returnFields.forEach(f => {
            filteredItem[f] = item[f];
        });
        return filteredItem;
    });
    const sortedFilteredData = sortOption
        ? filtered.sort((a, b) => a[sortOption.field] - b[sortOption.field])
        : filtered;
    const finalData = (sortOption && sortOption.filter)
        ? sortedFilteredData.filter(sortOption.filter)
        : sortedFilteredData;
    const pageSize = 10;
    const page = Math.max(parseInt(pageParam || '1'), 1);
    const startIndex = (page - 1) * pageSize;
    const paginatedData = finalData.slice(startIndex, startIndex + pageSize);
    return {
        data: paginatedData,
        currentPage: page,
        totalPages: Math.ceil(sortedFilteredData.length / pageSize),
        totalItems: sortedFilteredData.length,
        retrievedAt: formatted.retrievedAt
    };
};
exports.sortAndFilterData = sortAndFilterData;
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
        const cachedData = yield getFromCache(cacheKey);
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
                yield setInCache(cacheKey, response.data[0]);
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
        const cachedData = yield getFromCache(cacheKey);
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
            yield setInCache(cacheKey, data);
            res.json(data);
        }
        catch (error) {
            handleError(res, "Failed to process CSV data");
        }
    }),
    getDCFValue: createPythonScriptController('../dataExtractor/stocks/getDCFValue.py', (req) => `dcfValue:${req.params.symbol.toUpperCase()}`),
    getDDMValue: createPythonScriptController('../dataExtractor/stocks/getDDMValue.py', (req) => `ddmValue:${req.params.symbol.toUpperCase()}`),
    getBenjaminGrahamValue: createPythonScriptController('../dataExtractor/stocks/getBenjaminGrahamValue.py', (req) => `benjaminGrahamValue:${req.params.symbol.toUpperCase()}`),
    getIntrinsicValueList: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const sortBy = req.query.sortBy || 'Overall Value';
        const page = req.query.page || '1';
        const cacheKey = 'intrinsicValueList' + `:${sortBy}:${page}`;
        try {
            const cachedData = yield getFromCache(cacheKey);
            if (cachedData) {
                res.json(cachedData);
                return;
            }
            const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
            const dbName = "stock_analysis";
            const collectionName = "company_valuations";
            const client = new mongodb_1.MongoClient(uri);
            yield client.connect();
            const db = client.db(dbName);
            const collection = db.collection(collectionName);
            const mongoData = yield collection.find({}).toArray();
            yield client.close();
            const formattedData = {
                data: mongoData,
                retrievedAt: getCurrentTimeEDT()
            };
            const sortedAndFiltereddata = (0, exports.sortAndFilterData)(formattedData, req.query.sortBy, req.query.page);
            yield setInCache(cacheKey, sortedAndFiltereddata);
            res.json(sortedAndFiltereddata);
        }
        catch (error) {
            if (!res.headersSent) {
                res.status(500).json({ message: 'Failed to fetch data from MongoDB' });
            }
        }
    })
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
