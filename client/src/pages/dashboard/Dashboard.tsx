import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stock } from '../../types/stocks';
import DashboardItem from '../../components/dashboardItem/dashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/loadingSpinner';
import './Dashboard.css';

const createStockObject = (stockData: any): Stock => ({
  name: stockData['Company Name'] || 'Unknown Company',
  symbol: stockData['Symbol'] || 'N/A',
  price: parseFloat(stockData['Price']) || 0,
  change: parseFloat(stockData['Change'].replace(/[+,%]/g, '')) || 0,
  percentChange: parseFloat(stockData['Change%'].replace(/[+,%]/g, '')) || 0,
});

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [stockList, setStockList] = useState<Stock[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStocks = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/getTop10Stocks');
            const data = await response.json();
            const formattedData: Stock[] = data.map(createStockObject);
            setStockList(formattedData);
        } catch (error) {
            console.error('Error fetching stock data:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchStocks();
}, []);


  const filteredStocks = stockList.filter((stock: Stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleItemClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <p className="dashboard__title">Current Market</p>
        <div className="dashboard__search-box">
          <input
            type="text"
            className="dashboard__search"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {loading ? (
        <LoadingSpinner />
      ) : (
        filteredStocks.map((stock: Stock) => (
          <DashboardItem 
            key={stock.symbol} 
            {...stock}
            onClick={() => handleItemClick(stock.symbol)}
          />
        ))
      )}
    </div>
  );
}

export default Dashboard;