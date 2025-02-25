import { fetchData, getCachedData, setCachedData } from '../utils/utils';
import { Stock } from '../../types/Stock';

const API_BASE_URL = process.env.NODE_ENV === 'development'
        ? 'http://localhost:8000/api/stocks'
        : 'https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock';

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
            const [priceData, profileData, forecastData, analysisData, epsData, peRatioData, bondYieldData] = await Promise.all([
                fetchData(`${API_BASE_URL}/get-historical-data/${symbol}`),
                fetchData(`${API_BASE_URL}/get-profile/${symbol}`),
                fetchData(`${API_BASE_URL}/get-forecast/${symbol}`),
                fetchData(`${API_BASE_URL}/analysis/${symbol}`),
                fetchData(`${API_BASE_URL}/get-eps/${symbol}`),
                fetchData(`${API_BASE_URL}/get-pe-ratio/${symbol}`),
                fetchData(`${API_BASE_URL}/get-aaa-corp-bond-yield`),
            ]);
            console.log(currentStock)
            console.log(stockInfo)
            console.log(priceData.data)
            console.log(profileData)
            console.log(forecastData)
            console.log(analysisData)
            console.log(epsData)
            console.log(peRatioData)
            console.log(bondYieldData)
            console.log("growth rate "+stockInfo.growthRate)
            console.log("dividend "+stockInfo.dividends)
            const newStockData: Stock = {
                info: currentStock,
                detail: stockInfo,
                price: priceData.data,
                profile: profileData,
                forecast: forecastData,
                analysis: analysisData,
                eps: epsData?.EPS_Data,
                peRatio: peRatioData?.PE_Ratio_Data,
                growthRate: stockInfo?.growthRate,
                bondYield: bondYieldData?.aaaCorporateBondYield,
                dividends: stockInfo?.dividends
            };
            console.log(newStockData);
            console.log("SINI")
            setStockData(newStockData);
            setCachedData(`stock_${symbol}`, newStockData);
        }
    } catch (err: any) {
        console.log(err);
        setError(err.message || 'An error occurred while fetching stock data');
    } finally {
        setLoading(false);
    }
};
