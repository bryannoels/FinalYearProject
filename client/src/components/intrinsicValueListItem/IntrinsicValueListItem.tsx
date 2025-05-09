import React from 'react';
import './IntrinsicValueListItem.css';

interface ValuationDataItem {
  [key: string]: any;
  'Stock Symbol': string;
  'Company Name': string;
  'Opening Price'?: number;
}

interface IntrinsicValueItemProps {
  stock: ValuationDataItem;
  sortBy: string;
  onClick: () => void;
  animationDelay: number;
}

const IntrinsicValueListItem: React.FC<IntrinsicValueItemProps> = ({ stock, sortBy, onClick, animationDelay }) => {
  const getDisplayData = () => {
    const displayConfig: Record<string, { primary: string; secondary?: string; label: string; percentField?: string }> = {
      beta: { 
        primary: 'Beta', 
        secondary: 'Opening Price',
        label: 'Beta' 
      },
      percent_dcf: { 
        primary: 'DCF Value', 
        secondary: 'Opening Price',
        percentField: 'Percent DCF',
        label: 'DCF Value' 
      },
      percent_ddm: { 
        primary: 'DDM Value', 
        secondary: 'Opening Price',
        percentField: 'Percent DDM',
        label: 'DDM Value' 
      },
      percent_graham: { 
        primary: 'Benjamin Graham Value', 
        secondary: 'Opening Price',
        percentField: 'Percent Benjamin Graham',
        label: 'Graham Value' 
      },
      percent_average: { 
        primary: 'Average Value', 
        secondary: 'Opening Price',
        percentField: 'Percent Average',
        label: 'Average Value' 
      },
      percent_abs_dcf: { 
        primary: 'DCF Value', 
        secondary: 'Opening Price',
        percentField: 'Percent Abs DCF',
        label: 'Abs DCF' 
      },
      percent_abs_ddm: { 
        primary: 'DDM Value', 
        secondary: 'Opening Price',
        percentField: 'Percent Abs DDM',
        label: 'Abs DDM' 
      },
      percent_abs_graham: { 
        primary: 'Benjamin Graham Value', 
        secondary: 'Opening Price',
        percentField: 'Percent Abs Benjamin Graham',
        label: 'Abs Graham' 
      },
      percent_abs_average: { 
        primary: 'Average Value', 
        secondary: 'Opening Price',
        percentField: 'Percent Abs Average',
        label: 'Abs Average' 
      },
      stddev: { 
        primary: 'Intrinsic Value Standard Deviation', 
        secondary: 'Opening Price',
        label: 'StdDev' 
      }
    };

    const config = displayConfig[sortBy];
    if (!config) return { 
      primaryValue: '-', 
      secondaryValue: '-', 
      percentValue: null,
      label: 'Value'
    };

    const primaryValue = stock[config.primary] !== undefined ? 
      formatValue(stock[config.primary]) : '-';
    
    const secondaryValue = config.secondary && stock[config.secondary] !== undefined ? 
      formatValue(stock[config.secondary]) : null;
    
    const percentValue = config.percentField && stock[config.percentField] !== undefined ? 
      stock[config.percentField] : null;

    return {
      primaryValue,
      secondaryValue,
      percentValue,
      label: config.label
    };
  };

  const formatValue = (value: number | string): string => {
    if (typeof value === 'number') {
      return value.toLocaleString('en-US', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
    return String(value);
  };

  const formatPercent = (value: number): string => {
    return value.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + '%';
  };

  const getValueStatus = (percentValue: number | null): string => {
    if (percentValue === null) return '';
    
    if (sortBy.includes('abs')) {
      return 'neutral';
    }
    
    if (sortBy === 'beta') {
      return percentValue < 1 ? 'undervalued' : percentValue > 1 ? 'overvalued' : 'neutral';
    }
    
    if (sortBy === 'stddev') {
      return percentValue < 0.15 ? 'undervalued' : percentValue > 0.3 ? 'overvalued' : 'neutral';
    }

    return percentValue < 0 ? 'undervalued' : percentValue > 0 ? 'overvalued' : 'neutral';
  };

  const { primaryValue, secondaryValue, percentValue, label } = getDisplayData();
  const valueStatus = getValueStatus(percentValue);

  const patternColors = [
    { light: '#e5e7ff', dark: '#4a63ee' },
    { light: '#e7f5ff', dark: '#3b82f6' },
    { light: '#e6fffb', dark: '#0d9488' },
    { light: '#fef3f2', dark: '#ef4444' },
    { light: '#fef9c3', dark: '#eab308' }
  ];

  const colorIndex = stock['Stock Symbol'].charCodeAt(0) % patternColors.length;
  const patternColor = patternColors[colorIndex];

  return (
    <div 
      className={`value-card ${valueStatus}`}
      onClick={onClick}
      style={{
        '--animation-delay': `${animationDelay * 80}ms`,
        '--card-hue': `${(animationDelay * 10) % 360}deg`,
        '--light-color': patternColor.light,
        '--dark-color': patternColor.dark
      } as React.CSSProperties}
    >
      <div className="card-content">
        <div className="stock-info">
          <div className="stock-symbol">{stock['Stock Symbol']}</div>
          <div className="company-name">{stock['Company Name']}</div>
        </div>
        
        <div className="value-info">
          <div className="value-label">{label}</div>
          <div className="value-primary">{primaryValue}</div>
          
          {percentValue !== null && (
            <div className={`value-percent ${valueStatus}`}>
              {formatPercent(percentValue)}
              <span className="indicator"></span>
            </div>
          )}
          
          {secondaryValue && (
            <div className="value-secondary">
              Current: {secondaryValue}
            </div>
          )}
        </div>
      </div>

      <div className="card-ripple"></div>
    </div>
  );
};

export default IntrinsicValueListItem;