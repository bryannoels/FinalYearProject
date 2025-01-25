import React from 'react';
import { Stock } from '../../types/Stock';


interface ValuationMeasuresProps {
  stockData: Stock | null;
}

const ValuationMeasures: React.FC<ValuationMeasuresProps> = ({ stockData }) => {
    if (stockData == null || stockData.detail == null) return null;

    const labels = {
        "Opening Price": stockData?.detail?.openingPrice,
        "Previous Close": stockData?.detail?.previousClose,
        "Volume": stockData?.detail?.volume,
        "Market Cap": stockData?.detail?.marketCap,
        "Total Revenue": stockData?.detail?.totalRevenue,
        "Current Ratio": stockData?.detail?.currentRatio,
        "PE Ratio": stockData?.detail?.peRatio,
        "Price/Book": stockData?.detail?.priceToBook,
        "Earnings Growth": stockData?.detail?.earningsGrowth,
        "Revenue Per Share": stockData?.detail?.revenuePerShare,
        "EBITDA": stockData?.detail?.ebitda,
        "Growth Rate": stockData?.detail?.growthRate
    };

    return (
        <>
            <p className="stock-details__title">Valuation Measures</p>
            <div className="stock-details__table">
                {Object.entries(labels).map(([label, value]) => (
                    <div className="stock-details__table__row" key={label}>
                        <div className="stock-details__table__label">{label}</div>
                        <div className="stock-details__table__value">{value}</div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default ValuationMeasures;
