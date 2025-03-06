import { Request, Response } from 'express';
import { spawn } from 'child_process';
import { StockAnalysis } from '../types/stockAnalysis';
import axios from 'axios';
import csv from "csv-parser";
import fs from "fs";

type BenjaminGrahamData = {
    "Stock Symbol": string;
    "Defensive Value": number;
    "Defensive": string;
    "Enterprising Value": number;
    "Enterprising": string;
    "Overall Value": number;
  };

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

const getTopStocks = (req: Request, res: Response): void => {
    const { category } = req.query;
    const validCategories = ["most-active", "trending", "gainers", "losers", "52-week-gainers", "52-week-losers"];

    if (category && !validCategories.includes(category as string)) {
        res.status(400).json({ error: "Invalid category parameter" });
        return;
    }

    const pythonProcess = spawn('python3', ['src/stocks/getTopStock.py', category as string || "most-active"]);

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
            const pythonProcess = spawn('python3', ['src/stocks/getAnalysis.py', stockSymbol]);
            pythonProcess.stdout.on('data', (data) => {
                try {
                    const analysisData: StockAnalysis = JSON.parse(data.toString());
                    const verdict = analysisData.verdict;
                    const num_of_buys = analysisData.number_of_buy;
                    const num_of_holds = analysisData.number_of_hold;
                    const num_of_sells = analysisData.number_of_sell;
                    const ratings = analysisData.ratings;
                    if (!res.headersSent) {
                        res.json({ verdict, num_of_buys, num_of_holds, num_of_sells, ratings });
                    }
                } catch (error) {
                    if (!res.headersSent) {
                        res.status(500).json({ error: 'Failed to parse response' });
                    }
                }
            });
    // Lambda func ver:
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

const applyFilter = (data: BenjaminGrahamData[], filterBy: string, type: "Defensive" | "Enterprising") => {
    return data.filter((row) => {
      const value = row[type];
      return filterBy.split("").every((bit, index) => bit === "0" || value[index] === "1");
    });
  };
  
  const getBenjaminGrahamList = async (req: Request, res: Response): Promise<void> => {
    const { sortBy, filterBy, page = "1" } = req.query;
    
    const pageNumber = parseInt(page as string, 10) || 1;
    const pageSize = 10;
    
    if (!sortBy || !["Defensive", "Enterprising", "Overall"].includes(sortBy as string)) {
      res.status(400).json({ error: "Invalid sortBy parameter" });
      return;
    }
      
    if (filterBy && typeof filterBy === "string" && (sortBy === "Defensive" || sortBy === "Enterprising")) {
      if (!/^[01]{7}$/.test(filterBy)) {
        res.status(400).json({ error: "Invalid filterBy format" });
        return;
      }
    }
      
    try {
      let stockData: BenjaminGrahamData[] = [];
      
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream("src/sp500/data.csv")
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
      
      res.json({
        data: paginatedData,
        pagination: {
          currentPage: validPageNumber,
          totalPages,
          pageSize,
          totalItems,
          hasNextPage: validPageNumber < totalPages,
          hasPreviousPage: validPageNumber > 1
        }
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Failed to process CSV data" });
    }
  };
  

export {
    getStockData,
    getStockProfile,
    getTopStocks,
    getAnalysis,
    getHistoricalData,
    getForecastData,
    getEPSData,
    getPeRatioData,
    getAaaCorporateBondYield,
    searchStock,
    getBenjaminGrahamList
};
