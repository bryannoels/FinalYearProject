import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import './Dashboard.css';
import { AuthContext } from '../../context/AuthContext';

const createStockObject = (stockData: any): StockInfo => ({
  name: stockData['Company Name'] || 'Unknown Company',
  symbol: stockData['Symbol'] || 'N/A',
  price: parseFloat(stockData['Price']) || 0,
  change: parseFloat(stockData['Change']?.replace(/[+,%]/g, '')) || 0,
  percentChange: parseFloat(stockData['Change%']?.replace(/[+,%]/g, '')) || 0,
});

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [portfolioStockList, setPortfolioStockList] = useState<
    { portfolioName: string; stocks: StockInfo[] }[]
  >([]);
  const [marketStockList, setMarketStockList] = useState<StockInfo[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const { user, isAuthenticated } = useContext(AuthContext);
  const [showMessage, setShowMessage] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  const fetchPortfolio = async () => {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (authToken) {
      setPortfolioLoading(true);
      try {
        const payload = {
          "method": "getPortfolio"
        };
        
        const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify(payload)
          });
        
        const result = await response.json();
        const data = result.data;

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
        const response = await fetch('http://localhost:8000/api/stocks/most-active');
        const data = await response.json();
        const formattedData: StockInfo[] = data.map(createStockObject);
        setMarketStockList(formattedData);
    } catch (error) {
        console.error('Error fetching stock data:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchStocks();
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

  const filteredStocks = marketStockList.filter((stock: StockInfo) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const renderMarketStocks = () =>
    loading ? (
      <LoadingSpinner />
    ) : (
      filteredStocks.map((stock: StockInfo) => (
        <DashboardItem 
          key={stock.symbol} 
          {...stock}
          onClick={() => handleItemClick(stock.symbol)}
        />
      ))
    );

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        {isAuthenticated && user && (
          <div className="dashboard__user-portfolio__container">
            <button type="submit" className="button">Create new portfolio</button>
            {portfolioLoading ? (
                <LoadingSpinner />
              ) : (
                userPortfolioStocks.map((portfolio) => (
                <div key={portfolio.portfolioName} className="portfolio-group">
                  <div className="portfolio__title">{portfolio.portfolioName}</div>
                  <div className="portfolio-stocks">
                    {portfolio.stocks.map((stock) => (
                      <DashboardItem
                        key={stock.symbol}
                        {...stock}
                        onClick={() => handleItemClick(stock.symbol)}
                      />
                    ))}
                  </div>
                </div>
                ))
              )
            }
            {showMessage && (
              <div className="message">
                {message}
              </div>
            )}
            {!showMessage && (
              <div className="dashboard__user__portfolio">
                
              </div>
                )}
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
          </div>
        </div>
      </div>
      {renderMarketStocks()}
    </div>
  );
}

export default Dashboard;