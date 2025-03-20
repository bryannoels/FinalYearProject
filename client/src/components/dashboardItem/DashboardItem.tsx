import React from 'react';
import { StockInfo } from '../../types/StockInfo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import './DashboardItem.css';

interface DashboardItemProps extends StockInfo {
    onClick: () => void;
    portfolio?: boolean;
    onClickDelete?: () => void;
    animationDelay?: number;
}

const DashboardItem: React.FC<DashboardItemProps> = ({ 
    name, 
    symbol, 
    price, 
    change, 
    percentChange, 
    portfolio, 
    onClick = () => {}, 
    onClickDelete = () => {},
    animationDelay = 0
}) => {
    const priceIncreased = change >= 0;
    
    return (
        <div 
            className={`dashboard__item ${priceIncreased ? 'increased' : 'decreased'}`}
            style={{ animationDelay: `${animationDelay * 100}ms` }}
            onClick={onClick}
        >
            <div className="dashboard__item__content">
                <div className="dashboard__item__left">
                    <div className="stock-symbol-badge">{symbol}</div>
                    <div className="stock-info">
                        <p className="dashboard__item__name">{name}</p>
                        <p className="dashboard__item__symbol">{symbol}</p>
                    </div>
                </div>
                
                <div className="dashboard__item__right">
                    <p className="dashboard__item__price">${price.toFixed(2)}</p>
                    <div className={`dashboard__item__change ${priceIncreased ? 'stock-up' : 'stock-down'}`}>
                        <FontAwesomeIcon 
                            icon={priceIncreased ? faArrowUp : faArrowDown} 
                            className="change-icon"
                        />
                        <span>{Math.abs(change).toFixed(2)} ({Math.abs(percentChange).toFixed(2)}%)</span>
                    </div>
                </div>
            </div>
            
            {portfolio && (
                <div className="dashboard__item__delete" onClick={(e) => {
                    e.stopPropagation();
                    onClickDelete();
                }}>
                    <FontAwesomeIcon icon={faTrash} className="delete__icon" />
                </div>
            )}
            
            <div className="card-gleam"></div>
        </div>
    );
};

export default DashboardItem;