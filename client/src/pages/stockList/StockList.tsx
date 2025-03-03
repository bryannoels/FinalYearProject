import { CurrentMarket } from '../currentMarket/currentMarket';
import './StockList.css';

function StockList() {
  return (
    <div className="stock-list">
      <CurrentMarket />
    </div>
  );
}

export default StockList;
