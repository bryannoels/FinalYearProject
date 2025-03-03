import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import './Dashboard.css';
import { AuthContext } from '../../context/AuthContext';
import { createStockObject } from './utils';
import { fetchPortfolioData } from './fetchData';
import Dropdown from '../../components/dropdown/Dropdown';
import { CurrentMarket } from '../currentMarket/currentMarket';

function Dashboard() {
  const [portfolioStockList, setPortfolioStockList] = useState<{ portfolioName: string; stocks: StockInfo[] }[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(true);
  const { user, isAuthenticated } = useContext(AuthContext);
  const [showMessage, setShowMessage] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');
  const [showCreateNewPortfolio, setShowCreateNewPortfolio] = useState<boolean>(false);
  const [portfolioSearchTerms, setPortfolioSearchTerms] = useState<{ [portfolioName: string]: string }>({});
  const [portfolioDropdowns, setPortfolioDropdowns] = useState<{ [portfolioName: string]: boolean }>({});
  const [searchAddStockResult, setAddStockResult] = useState<{ ticker: string; name: string }[]>([]);
  const ddAddStockRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();


  const searchStocks = async (query: string) => {
    if (query.length >= 1) {
      try {
        const response = await fetch(`https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock/search/${query}`);
        const result = await response.json();
        setAddStockResult(result)
      } catch (error) {
        console.error('Error fetching search suggestions:', error);
      }
    } else {
      setAddStockResult([]);
    }
  };
  

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

  const handleCreateNewPortfolio = () => {
    setShowCreateNewPortfolio((prev) => !prev);
  };

  const createNewPortfolio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (authToken) {
      const formData = new FormData(e.currentTarget);
      const portfolioName = formData.get('portfolioName');

      const payload = {
        method: 'addPortfolio',
        data: {
          portfolioName: portfolioName
        },
      };
      try {
        await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        });

        fetchPortfolio();
        setShowCreateNewPortfolio(false);
      } catch (error) {
        console.error('Error creating new portfolio:', error);
      }
    }
  };


  // Search stocks to add to portfolio
  useEffect(() => {
    const timeouts: { [key: string]: NodeJS.Timeout } = {};

    Object.keys(portfolioSearchTerms).forEach((portfolioName) => {
      if (portfolioSearchTerms[portfolioName].length >= 1) {
        timeouts[portfolioName] = setTimeout(() => {
          searchStocks(portfolioSearchTerms[portfolioName]);
        }, 200);
      }
    });

    return () => {
      Object.values(timeouts).forEach((timeout) => clearTimeout(timeout));
    };
  }, [portfolioSearchTerms]);

  // First time load stocks
  useEffect(() => {
    fetchPortfolio();
  }, []);

  const userPortfolioStocks = portfolioStockList
    .map((portfolio) => ({
      portfolioName: portfolio.portfolioName,
      stocks: portfolio.stocks,
    }));

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

        await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }).catch((error) => console.error('Server error: ', error));
        
        setPortfolioDropdowns((prev) => ({
          ...prev,
          [portfolioName]: false,
        }));
        setPortfolioSearchTerms((prev) => ({
          ...prev,
          [portfolioName]: '',
        }));

        fetchPortfolio();
      } catch (error) {
        console.error('Error adding stock to portfolio:', error);
      } finally {
        setPortfolioLoading(false);
      }
    }
  };

  const deleteStockFromPortfolio = async (portfolioName: string, symbol: string) => {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (authToken) {
      setPortfolioLoading(true);

      try {
        const payload = {
          method: 'deleteStock',
          data: {
            portfolioName: portfolioName,
            stockSymbol: symbol,
          },
        }

        await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(payload),
        }).catch((error) => console.error('Server error: ', error));

        fetchPortfolio();
      } catch (error) {
        console.error('Error deleting stock from portfolio:', error);
      } finally {
        setPortfolioLoading(false);
      }
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        {isAuthenticated && user && (
          <div className="dashboard__user__portfolio__container">
            <button type="submit" className="button" onClick={handleCreateNewPortfolio}>
              {showCreateNewPortfolio ? "Cancel" : "Create New Portfolio"}
            </button>
            {showCreateNewPortfolio && (
              <div className="dashboard__create__portfolio__container">
                <form onSubmit={createNewPortfolio}>
                  <input type="text" name="portfolioName" className="dashboard__create__portfolio__textbox" placeholder="Portfolio name" required/>
                  <button type="submit" className="dashboard__create__portfolio__button">
                    Create
                  </button>
                </form>
              </div>
            )}
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
                      <DashboardItem key={stock.symbol} {...stock}
                        onClick={() => handleItemClick(stock.symbol)}
                        portfolio={true}
                        onClickDelete={() => deleteStockFromPortfolio(portfolio.portfolioName, stock.symbol)} />
                    ))}
                  </div>
                </div>
              ))
            )}
            {showMessage && <div className="message">{message}</div>}
          </div>
        )}
      </div>
      <CurrentMarket />
    </div>
  );
}

export default Dashboard;
