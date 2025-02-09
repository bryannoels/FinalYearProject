import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import './Dashboard.css';
import { AuthContext } from '../../context/AuthContext';
import { createStockObject } from './utils';
import { fetchPortfolioData, fetchStockData } from './fetchData';
import Dropdown from './Dropdown';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [portfolioStockList, setPortfolioStockList] = useState<{ portfolioName: string; stocks: StockInfo[] }[]>([]);
  const [marketStockList, setMarketStockList] = useState<StockInfo[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [suggestions, setSuggestions] = useState<{ ticker: string; name: string }[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [showMessage, setShowMessage] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchPortfolio = async () => {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (authToken) {
      setPortfolioLoading(true);
      try {
        const data = await fetchPortfolioData(authToken);
        const portfolios = Object.entries(data).map(([portfolioName, stocks]) => ({
          portfolioName,
          stocks: (stocks as any[]).map(createStockObject),
        }));

        setPortfolioStockList(portfolios);
        setMessage('');
        setShowMessage(false);
      } catch (error) {
        setMessage('Error fetching portfolio: ' + error);
        setShowMessage(true);
      } finally {
        setPortfolioLoading(false);
      }
    }
  };

  const fetchStocks = async () => {
    setLoading(true);
    try {
        const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/get-most-active-stocks');
        const data = await response.json();
        const formattedData: StockInfo[] = JSON.parse(data).map(createStockObject);
        setMarketStockList(formattedData);
    } catch (error) {
      setMessage('Error fetching stocks: ' + error);
      setShowMessage(true);
    } finally {
      setLoading(false);
    }
  };

  const searchStocks = async (query: string) => {
    if (query.length >= 1) {
      try {
        const response = await fetch(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/search/${query}`);
        const result = await response.json();
        setSuggestions(result);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchTerm.length >= 1) {
      debounceTimeout.current = setTimeout(() => {
        searchStocks(searchTerm);
      }, 200);
    } else {
      setSuggestions([]);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchPortfolio();
    fetchStocks();
  }, []);

  useEffect(() => {
    if (suggestions.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [suggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userPortfolioStocks = portfolioStockList
    .map((portfolio) => ({
      portfolioName: portfolio.portfolioName,
      stocks: portfolio.stocks.filter(
        (stock) =>
          stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((portfolio) => portfolio.stocks.length > 0);

  const handleItemClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  return (
    <div className="dashboard">
      {showDropdown && suggestions.length > 0 && (
        <div className="overlay show" onClick={() => setShowDropdown(false)}></div>
      )}
      <div className="dashboard__header">
        {isAuthenticated && user && (
          <div className="dashboard__user-portfolio__container">
            <button type="submit" className="button">
              Create new portfolio
            </button>
            {portfolioLoading ? (
              <LoadingSpinner />
            ) : (
              userPortfolioStocks.map((portfolio) => (
                <div key={portfolio.portfolioName} className="portfolio-group">
                  <div className="portfolio__title">{portfolio.portfolioName}</div>
                  <div className="portfolio-stocks">
                    {portfolio.stocks.map((stock) => (
                      <DashboardItem key={stock.symbol} {...stock} onClick={() => handleItemClick(stock.symbol)} />
                    ))}
                  </div>
                </div>
              ))
            )}
            {showMessage && <div className="message">{message}</div>}
          </div>
        )}
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
            {showDropdown && suggestions.length > 0 && (
              <Dropdown
                suggestions={suggestions}
                dropdownRef={dropdownRef}
                onItemClick={handleItemClick}
                isOpen={showDropdown}
              />
            )}
          </div>
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        marketStockList.map((stock: StockInfo) => (
          <DashboardItem key={stock.symbol} {...stock} onClick={() => handleItemClick(stock.symbol)} />
        ))
      )}
    </div>
  );
}

export default Dashboard;
