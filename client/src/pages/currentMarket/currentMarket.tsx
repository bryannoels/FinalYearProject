
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import './CurrentMarket.css';

interface CurrentMarketProps {
    marketStockList: StockInfo[];
    loading: boolean;
    showMessage: boolean;
    message: string;
    handleItemClick: (symbol: string) => void;
}

export const CurrentMarket: React.FC<CurrentMarketProps> = ({ marketStockList, loading, showMessage, message, handleItemClick }) => { 
    return (
        <div className = "current-market">
            {loading ? (
                <LoadingSpinner />
            ) : (
                marketStockList.map((stock: StockInfo) => (
                <DashboardItem key={stock.symbol} {...stock} onClick={() => handleItemClick(stock.symbol)} />
                ))
            )}
            {showMessage && <div className="message">{message}</div>}
        </div>
  );
}