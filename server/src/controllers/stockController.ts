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
            res.status(500).json({ error: 'Error retrieving stock data' });
        }
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0 && !res.headersSent) {
            res.status(500).json({ error: 'Python script exited with code ' + code });
        }
    });
};

const getStockProfile = (req: Request, res: Response): void => {
    const stockSymbol = req.params.symbol.toUpperCase();
    const pythonProcess = spawn('python3', ['src/stocks/getStockProfile.py', stockSymbol]);

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
            res.status(500).json({ error: 'Error retrieving profile data' });
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

    // Currently in lambda func: LABA-node-stock-get-combined-analysis
    const handleGetVerdict = async (stock_symbol: string): Promise<any> => {
        const url = `https://production.dataviz.cnn.io/quote/analystratings/${stock_symbol}`;
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
            'Accept': 'application/json'
        };
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

            return { ...data, verdict };
        } catch (error) {
            throw new Error('Failed to fetch analyst ratings');
        }
    };

    const getAnalysis = async (req: Request, res: Response): Promise<any> => {
        try {
            const stockSymbol = req.params.symbol.toUpperCase();
            const { num_of_buys, num_of_holds, num_of_sells } = await handleGetVerdict(stockSymbol);
            handleGetVerdict(stockSymbol)
                .then((verdictData) => {
                    const { num_of_buys, num_of_holds, num_of_sells } = verdictData;
                    const pythonProcess = spawn('python3', ['src/stocks/getAnalysis.py', stockSymbol]);
                    pythonProcess.stdout.on('data', (data) => {
                        try {
                            const analysisData: StockAnalysis[] = JSON.parse(data.toString());
                            const combinedAnalysis = [
                                ...analysisData.filter(item => item.rating === 1).slice(0, num_of_buys).map(item => ({ ...item, ActionType: 'buy' })),
                                ...analysisData.filter(item => item.rating === 0).slice(0, num_of_holds).map(item => ({ ...item, ActionType: 'hold' })),
                                ...analysisData.filter(item => item.rating === -1).slice(0, num_of_sells).map(item => ({ ...item, ActionType: 'sell' })),
                            ];
                            if (!res.headersSent) {
                                res.json({ combinedAnalysis, num_of_buys, num_of_holds, num_of_sells });
                            }
                        } catch (error) {
                            if (!res.headersSent) {
                                res.status(500).json({ error: 'Failed to parse response' });
                            }
                        }
                    });
                });
    //         const params = {
    //             FunctionName: "LABA-python-stock-get-analysis", 
    //             Payload: JSON.stringify({ req.params.symbol.toUpperCase() })
    //         };

    //         const response = await lambda.invoke(params).promise();
    //         const analysisData = JSON.parse(JSON.parse(response.Payload).body);
            
    //          const combinedAnalysis = [
    //          ...analysisData.ratings.filter(item => item.rating === 1).slice(0, num_of_buys).map(item => ({ ...item, ActionType: "buy" })),
    //          ...analysisData.ratings.filter(item => item.rating === 0).slice(0, num_of_holds).map(item => ({ ...item, ActionType: "hold" })),
    //          ...analysisData.ratings.filter(item => item.rating === -1).slice(0, num_of_sells).map(item => ({ ...item, ActionType: "sell" })),
    //          ];

    //         return { 
    //             combinedAnalysis,
    //             num_of_buys,
    //             num_of_holds,
    //             num_of_sells,
    //         };
    //     } catch (error) {
    //         console.error("Error in getAnalysis:", error);
    //         throw new Error("Failed to process analysis data");
    //     }
    //     };

    // try {
    //     const { stock_symbol } = event
        
    //     const analysisResult = await getAnalysis(stock_symbol);
    //     console.log(analysisResult);
    //     return {
    //         statusCode: 200,
    //         body: JSON.stringify(analysisResult)
    //     };
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ error: 'Failed to fetch verdict data' });
        }
        // return {
        //     statusCode: 500,
        //     body: JSON.stringify({ error: error.message })
        // };
    }
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

const searchStock = (req: Request, res: Response): void => {
    const query = req.params.query.toUpperCase();
    const pythonProcess = spawn('python3', ['src/stocks/searchStock.py', query]);

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
            res.status(500).json({ error: 'Error retrieving the search result' });
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
    getStockProfile,
    getTop10MostActiveStocks,
    // getVerdict,
    getAnalysis,
    getHistoricalData,
    getForecastData,
    getEPSData,
    getPeRatioData,
    getAaaCorporateBondYield,
    searchStock
};
