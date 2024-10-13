import labaLogo from '../../assets/LabaLogo.png';
import { useState, useEffect } from 'react';
import { Stock } from '../../types/stocks';
import DashboardItem from '../../components/dashboardItem/dashboardItem';
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

  useEffect(() => {
    fetch('http://localhost:8000/api/stocks/most-active')
      .then((response) => response.json())
      .then((data) => {
        const formattedData: Stock[] = data.map(createStockObject);
        setStockList(formattedData);
      })
      .catch((error) => {
        console.error('Error fetching stock data:', error);
      });
  }, []);

  const filteredStocks = stockList.filter((stock: Stock) =>
    stock.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      {filteredStocks.map((stock: Stock) => (
        <DashboardItem key={stock.symbol} {...stock} />
      ))}
    </div>
  );
}

export default Dashboard;
