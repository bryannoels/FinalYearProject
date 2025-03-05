import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData, getCachedData, setCachedData } from '../../components/utils/utils';
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import { createStockObject } from '../utils/utils';

export function CurrentMarket () {
    const [marketStockList, setMarketStockList] = useState<StockInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showMessage, setShowMessage] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');
    const navigate = useNavigate();
    

    const fetchStocks = async () => {
        setLoading(true);
        try {
          const cachedStocks = getCachedData("10_most_active_stocks");
          if (cachedStocks) {
            setMarketStockList(cachedStocks);
          }
          else {
            const response = await fetchData('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-most-active-stocks');
            const formattedData: StockInfo[] = JSON.parse(response).map(createStockObject);
            setCachedData(`10_most_active_stocks`, formattedData);
            setMarketStockList(formattedData);
          }
        } catch (error) {
          setMessage('Error fetching stocks: ' + error);
          setShowMessage(true);
        } finally {
          setLoading(false);
        }
      };

      const handleItemClick = (symbol: string) => {
        navigate(`/stock/${symbol}`);
      };

      useEffect(() => {
        fetchStocks();
      }, []);   

    return (
        <div>
            {loading ? (
                <LoadingSpinner />
            ) : (
                marketStockList.map((stock: StockInfo) => (
                <DashboardItem key={stock.symbol} {...stock} onClick={() => handleItemClick(stock.symbol)} />
                ))
            )}
            {showMessage && <div className="message">{message}</div>}
        </div>
  );
}