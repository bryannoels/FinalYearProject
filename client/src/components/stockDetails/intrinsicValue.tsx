import React from "react";
import { Stock } from "../../types/Stock";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import "./styles.css";

interface IntrinsicValueProps {
  stockData: Stock;
}

const IntrinsicValueComponent: React.FC<IntrinsicValueProps> = ({ stockData }) => {
  if (!stockData.intrinsicValue) return null;

  return (
    <div className="intrinsic-container">
      <h2>Intrinsic Value Calculation</h2>

      <div className="valuation-sections">
        {/* DCF Model */}
        {stockData.intrinsicValue.DCF && (
          <div className="valuation-card fade-in">
            <h3>Discounted Cash Flow (DCF) Model</h3>
            <p><strong>Symbol:</strong> {stockData.intrinsicValue.DCF.Symbol}</p>
            <p><strong>Free Cash Flow:</strong> ${stockData.intrinsicValue.DCF.FreeCashFlow}</p>
            <p><strong>Growth Rate:</strong> {stockData.intrinsicValue.DCF.GrowthRate}%</p>
            <p><strong>WACC:</strong> {stockData.intrinsicValue.DCF.WACC}%</p>
            <p><strong>Enterprise Value:</strong> ${stockData.intrinsicValue.DCF.EnterpriseValue}</p>
            <p><strong>Net Debt:</strong> ${stockData.intrinsicValue.DCF.NetDebt}</p>
            <p className="intrinsic-value"><strong>Intrinsic Value:</strong> ${stockData.intrinsicValue.DCF.DCFIntrinsicValue}</p>
          </div>
        )}

        {/* DDM Model */}
        {stockData.intrinsicValue.DDM && (
          <div className="valuation-card fade-in">
            <h3>Dividend Discount Model (DDM)</h3>
            <p><strong>Symbol:</strong> {stockData.intrinsicValue.DDM.Symbol}</p>
            <p><strong>Dividend:</strong> ${stockData.intrinsicValue.DDM.Dividend}</p>
            <p><strong>Growth Rate:</strong> {stockData.intrinsicValue.DDM.GrowthRate}%</p>
            <p><strong>Beta:</strong> {stockData.intrinsicValue.DDM.Beta}</p>
            <p><strong>Cost of Equity:</strong> {stockData.intrinsicValue.DDM.CostOfEquity}%</p>
            <p className="intrinsic-value"><strong>Intrinsic Value:</strong> ${stockData.intrinsicValue.DDM.DDMIntrinsicValue}</p>
          </div>
        )}

        {/* Benjamin Graham Model */}
        {stockData.intrinsicValue.BenjaminGraham && (
          <div className="valuation-card fade-in">
            <h3>Benjamin Graham Model</h3>
            <BlockMath math="V^* = \frac{EPS \times (8.5 + 2g) \times 4.4}{Y}" />
            <p><strong>Symbol:</strong> {stockData.intrinsicValue.BenjaminGraham.Symbol}</p>
            <p><strong>EPS:</strong> ${stockData.intrinsicValue.BenjaminGraham.EPS}</p>
            <p><strong>Growth Rate:</strong> {stockData.intrinsicValue.BenjaminGraham.GrowthRate}%</p>
            <p><strong>Current Yield:</strong> {stockData.intrinsicValue.BenjaminGraham.CurrentYield}%</p>
            <p className="intrinsic-value"><strong>Intrinsic Value:</strong> ${stockData.intrinsicValue.BenjaminGraham.BenjaminGrahamIntrinsicValue}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntrinsicValueComponent;
