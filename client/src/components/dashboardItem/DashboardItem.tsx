import { StockInfo } from '../../types/StockInfo';
import './DashboardItem.css';

interface DashboardItemProps extends StockInfo {
    onClick: () => void;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ name, symbol, price, change, percentChange, onClick = () => {} }) => {
    return (
        <div className="dashboard__item" onClick={onClick}>
            <div className="dashboard__item__left">
                <p className="dashboard__item__name">{name}</p>
                <p className="dashboard__item__symbol">{symbol}</p>
            </div>
            <div className="dashboard__item__right">
                <p className="dashboard__item__price">${price.toFixed(2)}</p>
                <p className={`dashboard__item__change ${change >= 0 ? 'stock-up' : 'stock-down'}`}>
                    {change.toFixed(2)} ({percentChange.toFixed(2)}%)
                </p>
            </div>
        </div>
    );
};

export default DashboardItem;
