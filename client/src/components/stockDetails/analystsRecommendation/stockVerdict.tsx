import React from 'react';
import { Stock } from '../../../types/Stock';

interface StockVerdictProps {
  stockData: Stock | null;
}

const StockVerdict: React.FC<StockVerdictProps> = ({ stockData }) => {
    if (stockData == null || stockData.analysis == null) return null;
    console.log(stockData.analysis);
    return (
        <div className="stock-details__analysis">
            <div className="stock-detailss__analysis__left">
                <p className={`stock-detailss__analysis__left__text ${stockData.analysis.verdict}`}>{stockData.analysis.verdict.toUpperCase()}</p>
            </div>
            <div className="stock-detailss__analysis__right">
                <div className="stock-detailss__analysis__buys">
                    <div className="stock-detailss__analysis__value">{stockData.analysis.number_of_buy}</div>
                    <div className="stock-detailss__analysis__text">buys</div>
                </div>
                <div className="stock-detailss__analysis__holds">
                    <div className="stock-detailss__analysis__value">{stockData.analysis.number_of_hold}</div>
                    <div className="stock-detailss__analysis__text">holds</div>
                </div>
                <div className="stock-detailss__analysis__sells">
                    <div className="stock-detailss__analysis__value">{stockData.analysis.number_of_sell}</div>
                    <div className="stock-detailss__analysis__text">sells</div>
                </div>
            </div>
        </div>
    );
};

export default StockVerdict;
