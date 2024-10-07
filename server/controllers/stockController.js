const { spawn } = require('child_process');

const getStockData = (req, res) => {
    console.log("getStockData");
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['stocks/stocksData.py', stockSymbol]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            const stockData = JSON.parse(data.toString());
            res.json(stockData);
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

module.exports = {
    getStockData,
};
