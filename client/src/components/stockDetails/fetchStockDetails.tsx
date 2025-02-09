import { fetchData, getCachedData, setCachedData } from '../utils/utils';
import { Stock } from '../../types/Stock';

export const fetchStockDetails = async (
    symbol: string,
    setStockData: (data: Stock | null) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void
) => {
    setLoading(true);
    try {
        const cachedStock = getCachedData(`stock_${symbol}`);
        if (cachedStock) {
            setStockData(cachedStock);
        } else {
            const stockInfoResp = await fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-stock-data/${symbol}`);
            const stockInfo = JSON.parse(stockInfoResp);
            const currentStock = {
                name: stockInfo.companyName,
                symbol,
                price: parseFloat(stockInfo.currentPrice),
                change: parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose),
                percentChange: ((parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose)) / parseFloat(stockInfo.previousClose)) * 100,
            };

            const currentStockDetail = {
                companyName: stockInfo.companyName,
                currentPrice: stockInfo.currentPrice,
                openingPrice: stockInfo.openingPrice,
                previousClose: stockInfo.previousClose,
                volume: stockInfo.volume,
                marketCap: stockInfo.marketCap,
                totalRevenue: stockInfo.totalRevenue,
                currentRatio: stockInfo.currentRatio,
                peRatio: stockInfo.peRatio,
                priceToBook: stockInfo.priceToBook,
                earningsGrowth: stockInfo.earningsGrowth,
                revenuePerShare: stockInfo.revenuePerShare,
                ebitda: stockInfo.ebitda,
                growthRate: stockInfo.growthRate,
            };

            const [priceData, profileData, forecastData, analysisData, epsData, peRatioData, bondYieldData] = await Promise.all([
                fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-historical-data/${symbol}`),
                fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-profile/${symbol}`),
                fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-forecast/${symbol}`),
                fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/analysis/${symbol}`),
                fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-eps/${symbol}`),
                fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-pe-ratio/${symbol}`),
                fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-aaa-corp-bond-yield`),
                // fetchData(`http://localhost:8000/api/stocks/historical/${symbol}`),
                // fetchData(`http://localhost:8000/api/stocks/verdict/${symbol}`),
                // fetchData(`http://localhost:8000/api/stocks/forecast/${symbol}`),
                // fetchData(`http://localhost:8000/api/stocks/analysis/${symbol}`),
                // fetchData(`http://localhost:8000/api/stocks/eps/${symbol}`),
                // fetchData(`http://localhost:8000/api/stocks/pe-ratio/${symbol}`),
                // fetchData(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-aaa-corp-bond-yield`),
            ]);
            const newStockData: Stock = {
                info: currentStock,
                detail: stockInfo,
                price: priceData ? JSON.parse(priceData).data : null,
                profile: profileData ? JSON.parse(profileData) : null,
                forecast: forecastData ? JSON.parse(forecastData) : null,
                analysis: analysisData ? JSON.parse(analysisData) : null,
                eps: epsData ? JSON.parse(epsData).EPS_Data : null,
                peRatio: peRatioData ? JSON.parse(peRatioData).PE_Ratio_Data : null,
                growthRate: stockInfo.growthRate,
                bondYield: bondYieldData ? JSON.parse(bondYieldData).aaaCorporateBondYield : null,
                dividends: stockInfo.dividends
            };
            console.log(newStockData.price);
            console.log("newStockDataprice type:", typeof newStockData.price);
            setStockData(newStockData);
            setCachedData(`stock_${symbol}`, newStockData);
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred while fetching stock data');
    } finally {
        setLoading(false);
    }
};
