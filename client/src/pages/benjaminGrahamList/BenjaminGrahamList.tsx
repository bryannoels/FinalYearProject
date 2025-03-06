import { useState, useEffect } from 'react';
import { fetchData, getCachedData, setCachedData } from '../../components/utils/utils';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import BenjaminGrahamItem from '../../components/benjaminGrahamItem/BenjaminGrahamItem';
import { BenjaminGrahamStockInfo } from '../../types/BenjaminGrahamStockInfo';
import { createBenjaminGrahamStockObject } from '../utils/utils';
import './BenjaminGrahamList.css';

function BenjaminGrahamList() {
  const [sortBy, setSortBy] = useState<string>('Overall');
  const [filterBy, setFilterBy] = useState<string>('0000000');
  const [page, setPage] = useState<number>(1);
  const [marketStockList, setMarketStockList] = useState<BenjaminGrahamStockInfo[]>([]);
  const [dateTime, setDateTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const fetchStocks = async (sortBy: string, filterBy: string, page: number) => {
    setLoading(true);
    try {
      const cacheKey = `stocks_sort-by-${sortBy}_filter-by-${filterBy}_page-${page}`;
      const cachedStocks = getCachedData(cacheKey);
  
      if (cachedStocks) {
        setMarketStockList(cachedStocks.data);
        setDateTime(cachedStocks.timestamp);
      } else {
        const url = `http://localhost:8000/api/stocks/get-benjamin-graham-list?sortBy=${encodeURIComponent(sortBy)}&filterBy=${encodeURIComponent(filterBy)}&page=${encodeURIComponent(page)}`;
        const response = await fetchData(url);
        console.log(response);
        const formattedData: BenjaminGrahamStockInfo[] = response.data.map(createBenjaminGrahamStockObject)
        console.log(formattedData);
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

        setCachedData(cacheKey, { data: formattedData, timestamp: currentTimestamp });
        setMarketStockList(formattedData);
        setDateTime(currentTimestamp);
      }
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  useEffect(() => {
    fetchStocks(sortBy, filterBy, page);
  }, [sortBy, filterBy, page]);  

  return (
    <div className="benjamin-graham-list">
      <div className="dashboard__market__container">
          <p className="market__title">Benjamin Graham</p>
          <div className="market__search-box">
          </div>
      </div>
      <div className = "current-market">
        {loading ? (
            <LoadingSpinner />
        ) : (
            marketStockList.map((stock: BenjaminGrahamStockInfo) => (
            <BenjaminGrahamItem key={stock.symbol} {...stock} sortBy={sortBy} onClick={() => handleItemClick(stock.symbol)} />
            ))
        )}
      </div>
      <div className="data-date-time">
        Data is accurate as of <br /> <strong>{dateTime}</strong>
      </div>
    </div>
  );
}

export default BenjaminGrahamList;
