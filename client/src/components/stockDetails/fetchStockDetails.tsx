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
            const stockInfo = await fetchData(`http://localhost:8000/api/stocks/info/${symbol}`);
            const currentStock = {
                name: stockInfo.companyName,
                symbol,
                price: parseFloat(stockInfo.currentPrice),
                change: parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose),
                percentChange: ((parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose)) / parseFloat(stockInfo.previousClose)) * 100,
            };

            const [priceData, profileData, forecastData, analysisData, epsData, peRatioData, bondYieldData] = await Promise.all([
                fetchData(`http://localhost:8000/api/stocks/historical/${symbol}`).catch(() => null),
                fetchData(`http://localhost:8000/api/stocks/profile/${symbol}`).catch(() => null),
                fetchData(`http://localhost:8000/api/stocks/forecast/${symbol}`).catch(() => null),
                fetchData(`http://localhost:8000/api/stocks/analysis/${symbol}`).catch(() => null),
                fetchData(`http://localhost:8000/api/stocks/eps/${symbol}`).catch(() => null),
                fetchData(`http://localhost:8000/api/stocks/pe-ratio/${symbol}`).catch(() => null),
                fetchData(`http://localhost:8000/api/stocks/aaa-corporate-bond-yield`).catch(() => null),
            ]);

            const newStockData: Stock = {
                info: currentStock,
                detail: stockInfo,
                price: priceData ? priceData.data : null,
                profile: profileData ? profileData : null,
                forecast: forecastData ? forecastData : null,
                analysis: analysisData ? analysisData : null,
                eps: epsData ? epsData.EPS_Data : null,
                peRatio: peRatioData ? peRatioData.PE_Ratio_Data : null,
                growthRate: stockInfo.growthRate,
                bondYield: bondYieldData ? bondYieldData.aaaCorporateBondYield : null,
                dividends: stockInfo.dividends
            };
            console.log(newStockData.detail);
            setStockData(newStockData);
            setCachedData(`stock_${symbol}`, newStockData);
        }
    } catch (err: any) {
        setError(err.message || 'An error occurred while fetching stock data');
    } finally {
        setLoading(false);
    }
};
