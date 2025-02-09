import React from 'react';
import type { Stock } from '../../types/Stock';
import type { StockRatings } from '../../types/StockRatings';

interface StockRatingsProps {
  stockData: Stock | null;
}

const StockRatings: React.FC<StockRatingsProps> = ({ stockData }) => {
    if (stockData == null || stockData.analysis == null || stockData.analysis.ratings == null || stockData.analysis.ratings.length === 0) return null;
    
    return (
        <>
            <hr className = "stock-details__analysts__divider" />
            <p className = "stock-details__analysts__rating__title">Analysts' Rating</p>
            <div className = "stock-details__analysts-recommendation">
                { stockData.analysis.ratings.map((item: StockRatings, index: number) => {
                    const ratingClass =
                        item.rating === 1 ? "green-rating" :
                        item.rating === 0 ? "blue-rating" :
                        "red-rating";

                    return (
                        <div className="stock-details__analysts__row" key={`${item.firm}-${index}`}>
                            <div className="stock-details__analysts__firm">{item.firm}</div>
                            <div className={`stock-details__analysts__rating ${ratingClass}`}>{item.analysis}</div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default StockRatings;
