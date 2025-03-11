import { BenjaminGrahamStockInfo } from '../../types/BenjaminGrahamStockInfo';
import './BenjaminGrahamItem.css';

interface BenjaminGrahamItemProps extends BenjaminGrahamStockInfo {
    onClick: () => void;
    sortBy: string;
}

const BenjaminGrahamItem: React.FC<BenjaminGrahamItemProps> = ({ 
  symbol, 
  companyName, 
  defensiveValue, 
  defensive, 
  enterprisingValue, 
  enterprising, 
  overallValue, 
  sortBy, 
  onClick = () => {}
}) => {
    const displayValue = sortBy === 'Defensive' 
      ? defensiveValue
      : sortBy === 'Enterprising' 
        ? enterprisingValue
        : overallValue;
    
    const totalValue = sortBy === 'Defensive' || sortBy === 'Enterprising' 
      ? 7 
      : 14;
    
    return (
        <div className="benjamin__graham__item">
            <div className="benjamin__graham__item__left" onClick={onClick}>
                <p className="benjamin__graham__item__name">{companyName}</p>
                <p className="benjamin__graham__item__symbol">{symbol}</p>
            </div>
            <div className="benjamin__graham__item__right" onClick={onClick}>
                <div className="score-container">
                    <div className="score-circle">
                        <span className="score-value">{displayValue}</span>
                    </div>
                    <span className="score-total">out of {totalValue}</span>
                </div>
            </div>
        </div>
    );
};

export default BenjaminGrahamItem;