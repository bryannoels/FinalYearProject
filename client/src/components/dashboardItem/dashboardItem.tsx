import { Stock } from '../../types/stocks';
import './DashboardItem.css';

const DashboardItem = (stock: Stock) => {
    return(
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
)};
export default DashboardItem;