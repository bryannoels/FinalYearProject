import React from 'react';
import { Stock } from '../../../types/Stock';

interface StockForecastProps {
  stockData: Stock | null;
}

const StockForecast: React.FC<StockForecastProps> = ({ stockData }) => {
    if (stockData == null || stockData.forecast == null) return null;

    return (
        <div className="stock-details__forecast">
            <div className="stock-details__forecast__row">
                <div className="stock-details__forecast__label">High Target Price</div>
                <div className="stock-details__forecast__right green-rating">
                    <div className="stock-details__forecast__value">{stockData.forecast.high_target_price}</div>
                    <div className="stock-details__forecast__percent">({stockData.forecast.percent_high_price.toFixed(1)}%)</div>
                </div>
            </div>
            <div className="stock-details__forecast__row">
                <div className="stock-details__forecast__label">Median Target Price</div>
                <div className="stock-details__forecast__right blue-rating">
                    <div className="stock-details__forecast__value">{stockData.forecast.median_target_price}</div>
                    <div className="stock-details__forecast__percent">({stockData.forecast.percent_median_price.toFixed(1)}%)</div>
                </div>
            </div>
            <div className="stock-details__forecast__row">
                <div className="stock-details__forecast__label">Low Target Price</div>
                <div className="stock-details__forecast__right red-rating">
                    <div className="stock-details__forecast__value">{stockData.forecast.low_target_price}</div>
                    <div className="stock-details__forecast__percent">({stockData.forecast.percent_low_price.toFixed(1)}%)</div>
                </div>
            </div>
        </div>
    );
};

export default StockForecast;
