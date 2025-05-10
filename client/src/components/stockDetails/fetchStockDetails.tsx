import { fetchData, getCachedData, setCachedData } from '../utils/utils';
import { Stock} from '../../types/Stock';

const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api/stocks'
    : 'https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock';

const INFO_PARAMETER = process.env.NODE_ENV === 'development' ? 'info' : 'get-stock-data';

export const fetchStockDetails = async (
    symbol: string,
    setStockData: (data: Stock | null) => void,
    setLoading: (loading: boolean) => void,
    setError: (error: string | null) => void,
    setDateTime: (dateTime: string) => void
) => {
    const startTime = performance.now();
    setLoading(true);
    try {
        const cachedStock = getCachedData(`stock_${symbol}`);
        if (cachedStock) {
            setStockData(cachedStock.data);
            setDateTime(cachedStock.timestamp);
            setLoading(false);
            return;
        }
        const [stockInfoResp, priceData, profileData] = await Promise.all([
            fetchData(`${API_BASE_URL}/${INFO_PARAMETER}/${symbol}`),
            fetchData(`${API_BASE_URL}/get-historical-data/${symbol}`),
            fetchData(`${API_BASE_URL}/get-profile/${symbol}`),
        ]);
        
        const stockInfo = process.env.NODE_ENV === 'development' ? stockInfoResp : JSON.parse(stockInfoResp);
        
        const currentStock = {
            name: stockInfo.companyName,
            symbol,
            price: parseFloat(stockInfo.currentPrice),
            change: parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose),
            percentChange: ((parseFloat(stockInfo.currentPrice) - parseFloat(stockInfo.previousClose)) / parseFloat(stockInfo.previousClose)) * 100,
        };
        
        const initialStockData: Stock = {
            info: currentStock,
            detail: stockInfo,
            price: priceData.data,
            profile: profileData,
            forecast: null,
            analysis: null,
            eps: null,
            peRatio: null,
            growthRate: null,
            bondYield: null,
            dividends: stockInfo?.dividends,
            beta: priceData.beta,
            intrinsicValue: null
        };
        
        const currentTimestamp = new Date().toLocaleString('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
            timeZoneName: 'short',
            timeZone: 'America/New_York',
          });  
        
        setStockData(initialStockData);
        setDateTime(currentTimestamp);
        setLoading(false);
    
        Promise.allSettled([
            fetchData(`${API_BASE_URL}/get-forecast/${symbol}`),
            fetchData(`${API_BASE_URL}/analysis/${symbol}`),
            fetchData(`${API_BASE_URL}/get-eps/${symbol}`),
            fetchData(`${API_BASE_URL}/get-pe-ratio/${symbol}`),
            fetchData(`${API_BASE_URL}/get-aaa-corp-bond-yield`),
            fetchData(`${API_BASE_URL}/get-dcf-value/${symbol}`),
            fetchData(`${API_BASE_URL}/get-ddm-value/${symbol}`),
            fetchData(`${API_BASE_URL}/get-benjamin-graham-value/${symbol}`),
        ]).then(results => {
            const [forecastData, analysisData, epsData, peRatioData, bondYieldData, dcfData, ddmData, bgData] = results.map(result =>
                result.status === "fulfilled" ? result.value : null
            );

            const intrinsicValue = {
                DCF: dcfData,
                DDM: ddmData,
                BenjaminGraham: bgData
            };
    
            const newData = {
                info: initialStockData.info,
                detail: initialStockData.detail,
                price: initialStockData.price,
                profile: initialStockData.profile,
                forecast: forecastData || null,
                analysis: analysisData || null,
                eps: epsData?.EPS_Data || null,
                peRatio: peRatioData?.PE_Ratio_Data || null,
                growthRate: stockInfo?.growthRate || null,
                bondYield: bondYieldData?.aaaCorporateBondYield || null,
                dividends: stockInfo?.dividends,
                beta: initialStockData.beta,
                intrinsicValue: intrinsicValue
            };
            
            setStockData(newData);
            setCachedData(`stock_${symbol}`, {
                data: newData,
                timestamp: currentTimestamp,
            });
        });
    
    } catch (err: any) {
        setError(err.message || 'An error occurred while fetching stock data');
        setLoading(false);
    }

    const endTime = performance.now();
    console.log(`UI updated in ${endTime - startTime} ms`);
};
