import labaLogo from '../../assets/LabaLogo.png';
import { useState, useEffect } from 'react';
import './Dashboard.css';

type Stock = {
  icon: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
};

const createStockObject = (stockData: any): Stock => ({
  icon: labaLogo,
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
        <div className="dashboard__item" key={stock.symbol}>
          <div className="dashboard__item__left">
            <p className="dashboard__item__name">{stock.name}</p>
            <p className="dashboard__item__symbol">{stock.symbol}</p>
          </div>
          <div className="dashboard__item__right">
            <p className="dashboard__item__price">${stock.price.toFixed(2)}</p>
            <p className={`dashboard__item__change ${stock.change >= 0 ? 'stock-up' : 'stock-down'}`}>
              {stock.change.toFixed(2)} ({stock.percentChange.toFixed(2)}%)
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
