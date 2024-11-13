const { spawn } = require('child_process');
const axios = require('axios');

const getStockData = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['stocks/getStocksData.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            res.json(stockData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to parse response' });
        }
    });

    pythonProcess.stderr.on('data', (data) => {
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
        res.status(500).json({ error: 'Error retrieving stock data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};

const handleGetVerdict = async (stockSymbol) => {
    const url = `https://production.dataviz.cnn.io/quote/analystratings/${stockSymbol}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'application/json'
    };
    console.log(url);
    try {
        const response = await axios.get(url, { headers });
        const data = response.data[0];

        let verdict = '';
        const { percent_buys, percent_holds, percent_sells } = data;

        if (percent_buys >= percent_holds && percent_buys >= percent_sells) {
            verdict = 'buy';
        } else if (percent_holds >= percent_buys && percent_holds >= percent_sells) {
            verdict = 'hold';
        } else if (percent_sells >= percent_buys && percent_sells >= percent_holds) {
            verdict = 'sell';
        }
        console.log(data)
        return { ...data, verdict };
    } catch (error) {
        throw new Error('Failed to fetch analyst ratings');
    }
};

const getVerdict = async (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    
    try {
        const verdictData = await handleGetVerdict(stockSymbol);
        res.json(verdictData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAnalysis = (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    handleGetVerdict(stockSymbol)
        .then((verdictData) => {
            const { num_of_buys, num_of_holds, num_of_sells } = verdictData;
            const pythonProcess = spawn('python3', ['stocks/getAnalysis.py', stockSymbol]);
            pythonProcess.stdout.on('data', (data) => {
                try {
                    const parsedData = JSON.parse(data.toString());
                    const analysisData = parsedData.analysis
                    const combinedAnalysis = [
                        ...analysisData.filter(item => item.Action === 1).slice(0, num_of_buys).map(item => ({ ...item, ActionType: 'buy' })),
                        ...analysisData.filter(item => item.Action === 0).slice(0, num_of_holds).map(item => ({ ...item, ActionType: 'hold' })),
                        ...analysisData.filter(item => item.Action === -1).slice(0, num_of_sells).map(item => ({ ...item, ActionType: 'sell' })),
                    ];

                    res.json({
                        growthRate: parsedData.growthRate,
                        analysis: combinedAnalysis
                    });
                } catch (error) {
                    res.status(500).json({ error: 'Failed to parse response' });
                }
            });

            pythonProcess.stderr.on('data', (data) => {
                res.status(500).json({ error: 'Error retrieving analysis data' });
            });

            pythonProcess.on('close', (code) => {
                if (code !== 0) {
                    res.status(500).json({ error: 'Python script exited with code ' + code });
                }
            });
        })
        .catch((error) => {
            res.status(500).json({ error: 'Failed to fetch verdict data' });
        });
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
        res.status(500).json({ error: 'Error retrieving historical data' });
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};

const getForecastData = async (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const url = `https://production.dataviz.cnn.io/quote/forecast/${stockSymbol}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
        'Accept': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        res.json(response.data[0]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch forecast data' });
    }
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
    getForecastData,
    getEPSData
};
