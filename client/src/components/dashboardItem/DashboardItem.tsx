import { StockInfo } from '../../types/StockInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './DashboardItem.css';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';

interface DashboardItemProps extends StockInfo {
    onClick: () => void;
    portfolio?: boolean;
    onClickDelete?: () => void;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ name, symbol, price, change, percentChange, portfolio, onClick = () => {}, onClickDelete = () => {} }) => {
    return (
        <div className="dashboard__item">
            <div className="dashboard__item__left" onClick={onClick}>
                <p className="dashboard__item__name">{name}</p>
                <p className="dashboard__item__symbol">{symbol}</p>
            </div>
            <div className="dashboard__item__right" onClick={onClick}>
                <p className="dashboard__item__price">${price.toFixed(2)}</p>
                <p className={`dashboard__item__change ${change >= 0 ? 'stock-up' : 'stock-down'}`}>
                    {change.toFixed(2)} ({percentChange.toFixed(2)}%)
                </p>
            </div>
            {portfolio && <div className="dashboard__item__delete">
                <FontAwesomeIcon icon={faTrash} className="delete__icon" onClick={onClickDelete}/>
            </div>}
        </div>
        
    );
};

export default DashboardItem;
