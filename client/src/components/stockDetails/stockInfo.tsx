import React from 'react';
import { Stock } from '../../types/Stock';
import { useNavigate } from 'react-router-dom';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';


interface StockInfoProps {
    symbol: string,
    stockData: Stock | null;
}

const StockInfo: React.FC<StockInfoProps> = ({ symbol, stockData }) => {
    if (symbol == null || stockData == null) return null;
    const navigate = useNavigate();
    return (
        <>
            <div className="stock-details__top">
                <div className="stock-details__top__head">
                    <button className="stock-details__back" onClick={() => navigate('/')}>
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                    </button>
                    <div className="stock-details__name">
                        {symbol}
                    </div>
                </div>
                <DashboardItem key={symbol} {...stockData?.info} onClick={() => {}} />
            </div>
        </>
    );
};

export default StockInfo;
