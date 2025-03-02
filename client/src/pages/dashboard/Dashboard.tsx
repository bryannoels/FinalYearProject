import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchData, getCachedData, setCachedData } from '../../../src/components/utils/utils';
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import './Dashboard.css';
import { AuthContext } from '../../context/AuthContext';
import { createStockObject } from './utils';
import { fetchPortfolioData } from './fetchData';
import Dropdown from './Dropdown';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [portfolioSearchTerms, setPortfolioSearchTerms] = useState<{ [portfolioName: string]: string }>({});
  const [portfolioStockList, setPortfolioStockList] = useState<{ portfolioName: string; stocks: StockInfo[] }[]>([]);
  const [marketStockList, setMarketStockList] = useState<StockInfo[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchStockResult, setSuggestions] = useState<{ ticker: string; name: string }[]>([]);
  const [searchAddStockResult, setAddStockResult] = useState<{ ticker: string; name: string }[]>([]);
  const [portfolioDropdowns, setPortfolioDropdowns] = useState<{ [portfolioName: string]: boolean }>({});
  const [showSearchedStocks, setShowDropdown] = useState(false);

  const navigate = useNavigate();
  const { user, isAuthenticated } = useContext(AuthContext);
  const [showMessage, setShowMessage] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const ddAddStockRef = useRef<HTMLDivElement | null>(null);
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

  const searchStocks = async (query: string, type: string | null) => {
    if (query.length >= 1) {
      try {
        const response = await fetch(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/search/${query}`);
        const result = await response.json();
        type === 'portfolio' ? setAddStockResult(result) : setSuggestions(result);
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      type === 'portfolio' ? setAddStockResult([]) : setSuggestions([]);
    }
  };

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (searchTerm.length >= 1) {
      debounceTimeout.current = setTimeout(() => {
        searchStocks(searchTerm, null);
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
    const timeouts: { [key: string]: NodeJS.Timeout } = {};

    Object.keys(portfolioSearchTerms).forEach((portfolioName) => {
      if (portfolioSearchTerms[portfolioName].length >= 1) {
        timeouts[portfolioName] = setTimeout(() => {
          searchStocks(portfolioSearchTerms[portfolioName], 'portfolio');
        }, 200);
      }
    });

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, [portfolioSearchTerms]);

  useEffect(() => {
    fetchPortfolio();
    fetchStocks();
  }, []);

  useEffect(() => {
    if (searchStockResult.length > 0) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  }, [searchStockResult]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      
      setPortfolioDropdowns((prev) => {
        const updatedDropdowns = { ...prev };
        Object.keys(prev).forEach((portfolioName) => {
          const portfolioDropdownRef = ddAddStockRef.current;
          if (portfolioDropdownRef && !portfolioDropdownRef.contains(event.target as Node)) {
            updatedDropdowns[portfolioName] = false;
          }
        });
        return updatedDropdowns;
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userPortfolioStocks = portfolioStockList
    .map((portfolio) => ({
      portfolioName: portfolio.portfolioName,
      stocks: portfolio.stocks,
    }))
    .filter((portfolio) => portfolio.stocks.length > 0);

  const handleItemClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const handlePortfolioSearchChange = (portfolioName: string, value: string) => {
    setPortfolioSearchTerms((prev) => ({
      ...prev,
      [portfolioName]: value,
    }));

    setPortfolioDropdowns((prev) => ({
      ...prev,
      [portfolioName]: value.length > 0, // Show dropdown only if user types something
    }));
  };

  const addStockToPortfolio = async (symbol: string, portfolioName: string) => {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (authToken) {
      setPortfolioLoading(true);
      try {
        const payload = {
          method: 'addStock',
          data: {
            portfolioName: portfolioName,
            stockSymbol: symbol,
          },
        };
        const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });
  
        const result = await response.json();
        console.log('result: ', result);
      } catch (error) {
        console.error('Error adding stock to portfolio:', error);
      } finally {
        setPortfolioLoading(false);
      }
    }
  };

  return (
    <div className="dashboard">
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
                  <div className="portfolio__title__container">
                    <div className="portfolio__title">
                      {portfolio.portfolioName}
                    </div>
                    <div className="portfolio__add__stock__container">
                      <input
                        type="text"
                        className="dashboard__portfolio__search"
                        placeholder="Add a stock"
                        value={portfolioSearchTerms[portfolio.portfolioName] || ''}
                        onChange={(e) => handlePortfolioSearchChange(portfolio.portfolioName, e.target.value)}
                      />
                      {portfolioDropdowns[portfolio.portfolioName] && searchAddStockResult.length > 0 && (
                        <Dropdown
                          suggestions={searchAddStockResult}
                          dropdownRef={ddAddStockRef}
                          onItemClick={(symbol) => addStockToPortfolio(symbol, portfolio.portfolioName)}
                          isOpen={portfolioDropdowns[portfolio.portfolioName]}
                        />
                      )}
                    </div>
                  </div>
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
