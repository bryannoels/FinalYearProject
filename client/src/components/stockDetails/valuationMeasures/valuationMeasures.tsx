import React from 'react';
import { Stock } from '../../../types/Stock';

interface ValuationMeasuresProps {
  stockData: Stock | null;
}

const ValuationMeasures: React.FC<ValuationMeasuresProps> = ({ stockData }) => {
  if (stockData == null || stockData.detail == null) return null;

  const labels = {
    "Opening Price": stockData.detail.openingPrice,
    "Previous Close": stockData.detail.previousClose,
    "Volume": stockData.detail.volume,
    "Market Cap": stockData.detail.marketCap,
    "Total Revenue": stockData.detail.totalRevenue,
    "Current Ratio": stockData.detail.currentRatio,
    "PE Ratio": stockData.detail.peRatio,
    "Price/Book": stockData.detail.priceToBook,
    "EPS": stockData.detail.eps,
    "Earnings Growth": stockData.detail.earningsGrowth,
    "Revenue Per Share": stockData.detail.revenuePerShare,
    "EBITDA": stockData.detail.ebitda,
    "Total Debt": stockData.detail.totalDebt,
    "Debt to Equity": stockData.detail.debtToEquity,
    "Growth Rate": stockData.detail.growthRate,
  };

  return (
    <div className="details-container">
      {Object.entries(labels)
        .filter(([_, value]) => value != null)
        .map(([label, value], index) => (
          <div
            className="detail-item"
            key={label}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="detail-label">{label}</div>
            <div className="detail-value">{value}</div>
          </div>
        ))
      }
    </div>
  );
};

export default ValuationMeasures;
