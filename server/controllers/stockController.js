const { spawn } = require('child_process');
const axios = require('axios');

const getStockData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['stocks/getStocksData.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            console.log(data.toString());
            const stockData = JSON.parse(data.toString());
            res.json(stockData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error retrieving historical data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};


const getTop10MostActiveStocks = (req, res) => {
    const pythonProcess = spawn('python3', ['stocks/getTopStock.py']);
    pythonProcess.stdout.on('data', (data) => {
        try {
            const stocksData = JSON.parse(data.toString());
            res.json(stocksData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error retrieving stock data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};

const getAnalysis = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['stocks/getAnalysis.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const analysisData = JSON.parse(data.toString());
            res.json(analysisData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error retrieving analysis data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};

const getVerdict = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['stocks/getVerdict.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const verdictData = JSON.parse(data.toString());
            res.json(verdictData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error retrieving verdict data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};

const getAnalystRatings = async (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const url = `https://production.dataviz.cnn.io/quote/analystratings/${stockSymbol}`;

    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching data from CNN:', error);
        res.status(500).json({ error: 'Failed to fetch analyst ratings' });
    }
};

const getHistoricalData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const rangeParam = req.query.range || '1d';

    const pythonProcess = spawn('python3', ['stocks/getHistoricalData.py', stockSymbol, rangeParam]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const historicalData = JSON.parse(data.toString());
            res.json(historicalData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error retrieving historical data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};

const getEPSData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['stocks/getEPSData.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const epsData = JSON.parse(data.toString());
            res.json(epsData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        res.status(500).json({ error: 'Error retrieving EPS data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};


module.exports = {
    getStockData,
    getTop10MostActiveStocks,
    getAnalysis,
    getVerdict,
    getHistoricalData,
    getEPSData,
    getAnalystRatings
};
