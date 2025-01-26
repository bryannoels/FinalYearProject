import React from 'react';
import { Stock } from '../../types/Stock';
import 'katex/dist/katex.min.css';
import { BlockMath } from 'react-katex';

const benjaminGrahamFormula = "V^* = \\frac{EPS \\times (8.5 + 2g) \\times 4.4}{Y}";

interface IntrinsicValueProps {
    stockData: Stock | null;
}

const IntrinsicValue: React.FC<IntrinsicValueProps> = ({ stockData }) => {
    if (stockData == null || stockData.eps == null || stockData.eps.length == 0) return null;
    const sortedEps = stockData.eps.sort((a, b) => a.Year - b.Year);

    const benjaminGrahamLabels = {
        "Earnings Per Share (EPS)": sortedEps[sortedEps.length - 1]?.EPS,
        "Growth Rate (g)": stockData.growthRate,
        "AAA Corporate Bond Yield (Y)": stockData.bondYield,
    };

    const intrinsicValue = (
        (stockData.eps[stockData.eps.length - 1]?.EPS * (8.5 + 2 * parseFloat(stockData.growthRate)) * 4.4) / 
        parseFloat(stockData.bondYield)
    ).toFixed(2);

  return (
    <>
      <p className="stock-details__title">Intrinsic Value (Benjamin Graham)</p>
      <div className="stock-details__pe-ratio">
        <BlockMath math={benjaminGrahamFormula} />
        {Object.entries(benjaminGrahamLabels).map(([label, value]) => (
          <div className="stock-details__pe-ratio__row" key={label}>
            <div className="stock-details__pe-ratio__label">{label}</div>
            <div className="stock-details__pe-ratio__value">{value}</div>
          </div>
        ))}
        <div className="stock-details__pe-ratio__row" key="Intrinsic Value">
          <div className="stock-details__pe-ratio__label bold-text">Intrinsic Value</div>
          <div className="stock-details__pe-ratio__value bold-text">{intrinsicValue}</div>
        </div>
      </div>
    </>
  );
};

export default IntrinsicValue;
