import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CurrentMarket } from '../currentMarket/currentMarket';
import Dropdown from '../../components/dropdown/Dropdown';
import { searchStocks } from '../utils/searchStocks';
import './StockList.css';

function StockList() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchStockResult, setSuggestions] = useState<{ ticker: string; name: string }[]>([]);
  const [showSearchedStocks, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

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
      <CurrentMarket />
    </div>
  );
}

export default StockList;
