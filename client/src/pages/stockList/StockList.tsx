import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData, getCachedData, setCachedData } from '../../components/utils/utils';
import { CurrentMarket } from '../currentMarket/currentMarket';
import { searchStocks } from '../utils/searchStocks';
import { createStockObject, formatCategoryName } from '../utils/utils';
import { StockInfo } from '../../types/StockInfo';
import { SearchResult } from '../../types/SearchResult';
import './StockList.css';

function StockList() {
  const categories = ['most-active', 'trending', 'gainers', 'losers', '52-week-gainers', '52-week-losers'];
  const [category, setCategory] = useState<string>('most-active');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [displayedSearchTerm, setDisplayedSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [searchStockResult, setSuggestions] = useState<SearchResult[]>([]);
  const [showSearchedStocks, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
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
        const result = response;
        console.log('Fetched stocks:', result);
        const formattedData: StockInfo[] = result.data.map(createStockObject);
        const timestamp = response.retrievedAt

        setCachedData(cacheKey, { data: formattedData, timestamp: timestamp });
        setMarketStockList(formattedData);
        setDateTime(timestamp);
      }
    } catch (_error) {
      console.log('Error fetching stocks:', _error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (symbol: string) => {
    setSearchTerm('');
    setDisplayedSearchTerm('');
    setShowDropdown(false);
    navigate(`/stock/${symbol}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length >= 1 && !isSearching) {
      setIsSearching(true);
    } else if (value.length === 0) {
      setIsSearching(false);
      setSuggestions([]);
      setShowDropdown(false);
      setDisplayedSearchTerm('');
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setDisplayedSearchTerm('');
    setSuggestions([]);
    setShowDropdown(false);
    setIsSearching(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, i) => 
      regex.test(part) ? <span key={i} className="highlight">{part}</span> : part
    );
  };

  const CustomDropdown = () => {
    if (!showSearchedStocks || searchStockResult.length === 0) return null;
    
    return (
      <div className="dropdown-container" ref={dropdownRef}>
        {searchStockResult.length > 0 ? (
          searchStockResult.map((item, index) => (
            <div 
              key={index} 
              className="dropdown-item"
              onClick={() => handleItemClick(item.ticker)}
              tabIndex={0}
              role="button"
            >
              <span className="dropdown-item-symbol">{item.ticker}</span>
              <span className="dropdown-item-name">
                {highlightMatch(item.name, displayedSearchTerm)}
              </span>
            </div>
          ))
        ) : (
          <div className="no-results">No matching stocks found</div>
        )}
      </div>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    fetchStocks(category);
  }, [category]);   

  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (searchTerm.length >= 1) {
      debounceTimeout.current = setTimeout(() => {
        setDisplayedSearchTerm(searchTerm);
        
        searchStocks(searchTerm, (results: SearchResult[]) => {
          setSuggestions(results);
          setIsSearching(false);
          setShowDropdown(results.length > 0);
        });
      }, 300);
    }
  
    return () => { 
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current); 
    };
  }, [searchTerm]);

  return (
    <div className="stock-list">
      <div className="dashboard__header">
        <div className="market__title">Current Market</div>
        <div className="market__search-box">
          <input
            ref={searchInputRef}
            type="text"
            className={`dashboard__search ${isSearching ? 'searching' : ''}`}
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={() => searchTerm.length > 0 && setShowDropdown(true)}
          />
          {searchTerm.length > 0 && (
            <button 
              className={`search-clear-button ${searchTerm ? 'visible' : ''}`} 
              onClick={clearSearch}
              aria-label="Clear search"
            />
          )}
          <CustomDropdown />
        </div>
      </div>

      <div className="category-tabs-section">
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
      </div>

      <div className="stock-list-content">
        <CurrentMarket 
          loading={loading} 
          marketStockList={marketStockList} 
          handleItemClick={handleItemClick}
        />
      </div>

      {
        !loading ?
          <div className="data-date-time">
            Data is accurate as of <br /> <strong>{dateTime}</strong>
          </div> 
        :null
      }
    </div>
  );
}

export default StockList;