import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { StockAnalysis } from '../types/stockAnalysis';
import axios from 'axios';

const getStockData = (req: Request, res: Response): void => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['src/stocks/getStockData.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stockData);
            }
        } catch (error) {
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

const getTop10MostActiveStocks = (req: Request, res: Response): void => {
    const pythonProcess = spawn('python3', ['src/stocks/getTopStock.py']);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stocksData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stocksData);
            }
        } catch (error) {
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

const getAnalysis = (req: Request, res: Response): void => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['src/stocks/getAnalysis.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const analysisData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(analysisData);
            }
        } catch (error) {
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


const getHistoricalData = (req: Request, res: Response): void => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const rangeParam = (req.query.range || '1d') as string;

    const pythonProcess = spawn('python3', ['src/stocks/getHistoricalData.py', stockSymbol, rangeParam]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const historicalData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(historicalData);
            }
        } catch (error) {
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

const getForecastData = async (req: Request, res: Response): Promise<void> => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const url = `https://production.dataviz.cnn.io/quote/forecast/${stockSymbol}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        if (!res.headersSent) {
            res.json(response.data[0]);
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch forecast data' });
        }
    }
};

const getEPSData = (req: Request, res: Response): void => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['src/stocks/getEPSData.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const epsData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(epsData);
            }
        } catch (error) {
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

const getPeRatioData = (req: Request, res: Response): void => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['src/stocks/getPeRatioData.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const epsData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(epsData);
            }
        } catch (error) {
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

const getAaaCorporateBondYield = async (req: Request, res: Response): Promise<void> => {
    const pythonProcess = spawn('python3', ['src/stocks/getAaaCorporateBondYield.py']);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stocksData = JSON.parse(data.toString());
            if (!res.headersSent) {
                res.json(stocksData);
            }
        } catch (error) {
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

export {
    getStockData,
    getTop10MostActiveStocks,
    getAnalysis,
    getHistoricalData,
    getForecastData,
    getEPSData,
    getPeRatioData,
    getAaaCorporateBondYield
};
