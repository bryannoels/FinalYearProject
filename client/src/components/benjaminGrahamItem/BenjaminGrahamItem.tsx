
import { BenjaminGrahamStockInfo } from '../../types/BenjaminGrahamStockInfo';
import './BenjaminGrahamItem.css';

interface BenjaminGrahamItemProps extends BenjaminGrahamStockInfo {
    onClick: () => void;
    sortBy: string;
}

const BenjaminGrahamItem: React.FC<BenjaminGrahamItemProps> = ({ symbol, companyName, defensiveValue, defensive, enterprisingValue, enterprising, overallValue, sortBy, onClick = () => {}}) => {
    return (
        <div className="benjamin__graham__item">
            <div className="benjamin__graham__item__left" onClick={onClick}>
                <p className="benjamin__graham__item__name">{companyName}</p>
                <p className="benjamin__graham__item__symbol">{symbol}</p>
            </div>
            <div className="benjamin__graham__item__right" onClick={onClick}>
                <p className="benjamin__graham__item__sort__by">
                    Sort by {sortBy == 'defensive' ? 
                    'Long Term Value' : sortBy == 'enterprising' ?
                    'Short Term Value' : 'Overall Value'
                    }
            </p>
                <p className={`benjamin__graham__item__value`}>
                {
                    sortBy === 'defensive' ? `${defensiveValue} out of 7 points`
                    : sortBy === 'enterprising' ? `${enterprisingValue} out of 7 points`
                    : `${overallValue} out of 14 points`
                }
                </p>
            </div>
        </div>
        
    );
};

export default BenjaminGrahamItem;
