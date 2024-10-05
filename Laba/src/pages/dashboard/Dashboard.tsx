import labaLogo from '../../assets/LabaLogo.png';
import { useState } from 'react';
import './Dashboard.css';

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const stockList = [
    { icon: labaLogo, name: 'Apple Inc.', symbol: 'AAPL', price: 432.21, change: 2.53, percentChange: 0.58 },
    { icon: labaLogo, name: 'Amazon.com Inc.', symbol: 'AMZN', price: 245.89, change: -0.32, percentChange: -0.13 },
    { icon: labaLogo, name: 'Tesla Inc.', symbol: 'TSLA', price: 213.22, change: 2.49, percentChange: 1.18 },
    { icon: labaLogo, name: 'Meta Platforms Inc.', symbol: 'META', price: 821.87, change: -21.30, percentChange: -2.52 },
    { icon: labaLogo, name: 'Microsoft Corporation', symbol: 'MSFT', price: 245.32, change: 3.21, percentChange: 1.32 },
    { icon: labaLogo, name: 'Alphabet Inc.', symbol: 'GOOGL', price: 421.98, change: -12.40, percentChange: -2.87 },
    { icon: labaLogo, name: 'NVIDIA Corporation', symbol: 'NVDA', price: 507.94, change: 15.32, percentChange: 3.11 },
    { icon: labaLogo, name: 'Advanced Micro Devices Inc.', symbol: 'AMD', price: 102.35, change: 1.22, percentChange: 1.21 }
  ];

  const filteredStocks = stockList.filter(stock =>
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
      {filteredStocks.map((stock) => (
        <div className="dashboard__item" key={stock.symbol}>
          <img src={stock.icon} alt={stock.name} className="dashboard__item__icon" />
          <div className="dashboard__item__left">
            <p className="dashboard__item__name">{stock.name}</p>
            <p className="dashboard__item__symbol">{stock.symbol}</p>
          </div>
          <div className="dashboard__item__right">
            <p className="dashboard__item__price">${stock.price}</p>
            <p className={`dashboard__item__change ${stock.change >= 0 ? 'stock-up' : 'stock-down'}`}>
              {stock.change} ({stock.percentChange}%)
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;
