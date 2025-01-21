import React from 'react';
import { Stock } from '../../types/Stock';
import StockVerdict from './stockVerdict';
import StockForecast from './stockForecast';
import StockRatings from './stockRatings';


interface AnalystsRecommendationProps {
  stockData: Stock | null;
}

const AnalystsRecommendation: React.FC<AnalystsRecommendationProps> = ({ stockData }) => {
    if (stockData == null) return null;

    return (
        <>
            { stockData.verdict || stockData.forecast || stockData.ratings.length > 0 ? <p className="stock-details__title">Analysts' Recommendation</p> : null }
            <div className="stock-details__recommendation">
                <StockVerdict stockData={stockData} />
                <StockForecast stockData={stockData} />
                <StockRatings stockData={stockData} />
            </div>
        </>
    );
};

export default AnalystsRecommendation;
