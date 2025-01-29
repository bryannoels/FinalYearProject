import { fetchData, getCachedData, setCachedData } from '../../components/stockDetails/utils';
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
            const stockInfo = await fetchData(`http://localhost:8000/api/stocks/info/${symbol}`);
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

            const [priceData, forecastData, analysisData, epsData, peRatioData, bondYieldData] = await Promise.all([
                fetchData(`http://localhost:8000/api/stocks/historical/${symbol}`),
                fetchData(`http://localhost:8000/api/stocks/forecast/${symbol}`),
                fetchData(`http://localhost:8000/api/stocks/analysis/${symbol}`),
                fetchData(`http://localhost:8000/api/stocks/eps/${symbol}`),
                fetchData(`http://localhost:8000/api/stocks/pe-ratio/${symbol}`),
                fetchData(`http://localhost:8000/api/stocks/aaa-corporate-bond-yield`),
            ]);
            const newStockData: Stock = {
                info: currentStock,
                detail: currentStockDetail,
                price: priceData.data,
                forecast: forecastData,
                analysis: analysisData,
                eps: epsData.EPS_Data,
                peRatio: peRatioData.PE_Ratio_Data,
                growthRate: stockInfo.growthRate,
                bondYield: bondYieldData.aaaCorporateBondYield,
                dividends: stockInfo.dividends
            };
            setStockData(newStockData);
            setCachedData(`stock_${symbol}`, newStockData);
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred while fetching stock data');
    } finally {
        setLoading(false);
    }
};
