import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData, getCachedData, setCachedData } from '../../components/utils/utils';
import { CurrentMarket } from '../currentMarket/currentMarket';
import Dropdown from '../../components/dropdown/Dropdown';
import { searchStocks } from '../utils/searchStocks';
import { createStockObject, formatCategoryName } from '../utils/utils';
import { StockInfo } from '../../types/StockInfo';
import './StockList.css';

function StockList() {
  const categories = ['most-active', 'trending', 'gainers', 'losers', '52-week-gainers', '52-week-losers'];
  const [category, setCategory] = useState<string>('most-active');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchStockResult, setSuggestions] = useState<{ ticker: string; name: string }[]>([]);
  const [showSearchedStocks, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [marketStockList, setMarketStockList] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [dateTime, setDateTime] = useState<string>('');
  const navigate = useNavigate();

  const fetchStocks = async (category: string) => {
    setLoading(true);
    try {
      const cacheKey = `stocks_${category}`;
      const cachedStocks = getCachedData(cacheKey);
  
      if (cachedStocks) {
        setMarketStockList(cachedStocks.data);
        setDateTime(cachedStocks.timestamp);
      } else {
        const url = `http://localhost:8000/api/stocks/get-top-stocks?category=${encodeURIComponent(category)}`;
        const response = await fetchData(url);
        const formattedData: StockInfo[] = response.map(createStockObject);
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
    fetchStocks(category);
  }, [category]);   

  useEffect(() => {
    debounceTimeout.current && clearTimeout(debounceTimeout.current);

    if (searchTerm.length >= 1) {
      debounceTimeout.current = setTimeout(() => searchStocks(searchTerm, setSuggestions), 200);
    } else {
      setSuggestions([]);
    }

    return () => { debounceTimeout.current && clearTimeout(debounceTimeout.current); };
  }, [searchTerm]);

  useEffect(() => {
    setShowDropdown(searchStockResult.length > 0);
  }, [searchStockResult]);  

  return (
    <div className="stock-list">
      <div className="dashboard__market__container">
        <p className="market__title">Current Market</p>
        <div className="market__search-box">
          <input
            type="text"
            className="dashboard__search"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {showSearchedStocks && searchStockResult.length > 0 && (
            <Dropdown
              suggestions={searchStockResult}
              dropdownRef={dropdownRef}
              onItemClick={handleItemClick}
              isOpen={showSearchedStocks}
            />
          )}
        </div>
      </div>
      <div className="benjamin-graham-list-buttons">
        {categories.map((cat) => (
          <div 
            key={cat} 
            className={`benjamin-graham-list-button ${category === cat ? 'active' : ''}`} 
            onClick={() => setCategory(cat)}
          >
            {formatCategoryName(cat)}
          </div>
        ))}
      </div>
      <CurrentMarket 
        loading={loading} 
        marketStockList={marketStockList} 
        handleItemClick={handleItemClick}
      />
      <div className="data-date-time">
        Data is accurate as of <br /> <strong>{dateTime}</strong>
      </div>
    </div>
  );
}

export default StockList;
