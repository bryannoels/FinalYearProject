
import { BenjaminGrahamStockInfo } from '../../types/BenjaminGrahamStockInfo';
import './BenjaminGrahamItem.css';

interface BenjaminGrahamItemProps extends BenjaminGrahamStockInfo {
    onClick: () => void;
}

const BenjaminGrahamItem: React.FC<BenjaminGrahamItemProps> = ({ symbol, companyName, defensiveValue, defensive, enterprisingValue, enterprising, overallValue, sortBy, onClick = () => {}}) => {
    return (
        <div className="benjamin__graham__item">
            <div className="benjamin__graham__item__left" onClick={onClick}>
                <p className="benjamin__graham__item__name">{companyName}</p>
                <p className="benjamin__graham__item__symbol">{symbol}</p>
            </div>
            <div className="benjamin__graham__item__right" onClick={onClick}>
                <p className="benjamin__graham__item__price">Sort by {sortBy}</p>
                <p className={`benjamin__graham__item__change`}>
                Defensive Value: {defensiveValue}
                    Enterprising Value: {enterprisingValue}
                    Overall Value: {overallValue}
                </p>
            </div>
        </div>
        
    );
};

export default BenjaminGrahamItem;
