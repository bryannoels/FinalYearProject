import React, { useEffect, useRef } from "react";
import { Stock } from "../../types/Stock";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";
import "./styles.css";

interface IntrinsicValueProps {
  stockData: Stock;
}

const IntrinsicValueComponent: React.FC<IntrinsicValueProps> = ({ stockData }) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      observerRef.current?.observe(el);
    });
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);
  
  if (!stockData.intrinsicValue) return null;
  
  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="intrinsic-container">
      <div className="header-section animate-on-scroll slide-down">
        <h2>Intrinsic Value Analysis</h2>
        <p className="ticker-symbol">{stockData.intrinsicValue.DCF?.Symbol || stockData.intrinsicValue.DDM?.Symbol || stockData.intrinsicValue.BenjaminGraham?.Symbol}</p>
      </div>

      {/* DCF Model */}
      {stockData.intrinsicValue.DCF && (
        <div className="valuation-card dcf-card animate-on-scroll slide-right">
          <div className="card-header">
            <div className="model-badge">DCF</div>
            <h3>Discounted Cash Flow</h3>
          </div>
          
          <div className="value-highlight">
            <div className="value-label">Intrinsic Value</div>
            <div className="value-amount">{formatCurrency(stockData.intrinsicValue.DCF.DCFIntrinsicValue)}</div>
          </div>
          
          <div className="collapsible-content">
            <div className="parameter-row">
              <span>Free Cash Flow</span>
              <span>{formatCurrency(stockData.intrinsicValue.DCF.FreeCashFlow)}</span>
            </div>
            <div className="parameter-row">
              <span>Growth Rate</span>
              <span>{stockData.intrinsicValue.DCF.GrowthRate}%</span>
            </div>
            <div className="parameter-row">
              <span>WACC</span>
              <span>{stockData.intrinsicValue.DCF.WACC}%</span>
            </div>
            <div className="parameter-row">
              <span>Enterprise Value</span>
              <span>{formatCurrency(stockData.intrinsicValue.DCF.EnterpriseValue)}</span>
            </div>
            <div className="parameter-row">
              <span>Net Debt</span>
              <span>{formatCurrency(stockData.intrinsicValue.DCF.NetDebt)}</span>
            </div>
          </div>
        </div>
      )}

      {/* DDM Model */}
      {stockData.intrinsicValue.DDM && (
        <div className="valuation-card ddm-card animate-on-scroll slide-left">
          <div className="card-header">
            <div className="model-badge">DDM</div>
            <h3>Dividend Discount Model</h3>
          </div>
          
          <div className="value-highlight">
            <div className="value-label">Intrinsic Value</div>
            <div className="value-amount">{formatCurrency(stockData.intrinsicValue.DDM.DDMIntrinsicValue)}</div>
          </div>
          
          <div className="collapsible-content">
            <div className="parameter-row">
              <span>Dividend</span>
              <span>{formatCurrency(stockData.intrinsicValue.DDM.Dividend)}</span>
            </div>
            <div className="parameter-row">
              <span>Growth Rate</span>
              <span>{stockData.intrinsicValue.DDM.GrowthRate}%</span>
            </div>
            <div className="parameter-row">
              <span>Beta</span>
              <span>{stockData.intrinsicValue.DDM.Beta}</span>
            </div>
            <div className="parameter-row">
              <span>Cost of Equity</span>
              <span>{stockData.intrinsicValue.DDM.CostOfEquity}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Benjamin Graham Model */}
      {stockData.intrinsicValue.BenjaminGraham && (
        <div className="valuation-card graham-card animate-on-scroll slide-right">
          <div className="card-header">
            <div className="model-badge">Graham</div>
            <h3>Benjamin Graham Model</h3>
          </div>
          
          <div className="value-highlight">
            <div className="value-label">Intrinsic Value</div>
            <div className="value-amount">{formatCurrency(stockData.intrinsicValue.BenjaminGraham.BenjaminGrahamIntrinsicValue)}</div>
          </div>
          
          <div className="formula-container">
            <BlockMath math="V^* = \frac{EPS \times (8.5 + 2g) \times 4.4}{Y}" />
          </div>
          
          <div className="collapsible-content">
            <div className="parameter-row">
              <span>EPS</span>
              <span>{formatCurrency(stockData.intrinsicValue.BenjaminGraham.EPS)}</span>
            </div>
            <div className="parameter-row">
              <span>Growth Rate</span>
              <span>{stockData.intrinsicValue.BenjaminGraham.GrowthRate}%</span>
            </div>
            <div className="parameter-row">
              <span>Current Yield</span>
              <span>{stockData.intrinsicValue.BenjaminGraham.CurrentYield}%</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="valuation-summary animate-on-scroll fade-in">
        <h3>Valuation Summary</h3>
        <div className="summary-container">
          {stockData.intrinsicValue.DCF && (
            <div className="summary-item">
              <div className="summary-label">DCF</div>
              <div className="summary-value">{formatCurrency(stockData.intrinsicValue.DCF.DCFIntrinsicValue)}</div>
            </div>
          )}
          {stockData.intrinsicValue.DDM && (
            <div className="summary-item">
              <div className="summary-label">DDM</div>
              <div className="summary-value">{formatCurrency(stockData.intrinsicValue.DDM.DDMIntrinsicValue)}</div>
            </div>
          )}
          {stockData.intrinsicValue.BenjaminGraham && (
            <div className="summary-item">
              <div className="summary-label">Graham</div>
              <div className="summary-value">{formatCurrency(stockData.intrinsicValue.BenjaminGraham.BenjaminGrahamIntrinsicValue)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntrinsicValueComponent;