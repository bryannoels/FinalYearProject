import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData, getCachedData, setCachedData } from '../../components/utils/utils';
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import { createStockObject } from '../utils/utils';
import Dropdown from '../../components/dropdown/Dropdown';
import { searchStocks } from '../utils/searchStocks';

export function CurrentMarket () {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [marketStockList, setMarketStockList] = useState<StockInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showMessage, setShowMessage] = useState<boolean>(true);
    const [message, setMessage] = useState<string>('');
    const [searchStockResult, setSuggestions] = useState<{ ticker: string; name: string }[]>([]);
    const [showSearchedStocks, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement | null>(null);
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
        debounceTimeout.current && clearTimeout(debounceTimeout.current);
    
        if (searchTerm.length >= 1) {
          debounceTimeout.current = setTimeout(() => searchStocks(searchTerm, setSuggestions), 200);
        } else {
          setSuggestions([]);
        }
    
        return () => { debounceTimeout.current && clearTimeout(debounceTimeout.current); };
      }, [searchTerm]);

      useEffect(() => {
        fetchStocks();
      }, []);

      useEffect(() => {
        setShowDropdown(searchStockResult.length > 0);
      }, [searchStockResult]);      

    return (
        <div>
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