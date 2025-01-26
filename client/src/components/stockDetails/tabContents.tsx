import React, { useState } from 'react';
import { Stock } from '../../types/Stock';
import ValuationMeasures from './valuationMeasures';
import AnalystsRecommendation from './analystsRecommendation';
import EPSChart from './epsChart';
import PeRatioChart from './peRatioChart';
import IntrinsicValue from './intrinsicValue';
import TabButton from './tabButton';
import BenjaminGraham from './benjaminGraham/benjaminGraham';

interface TabContentsProps {
  stockData: Stock | null;
}

const TabContents: React.FC<TabContentsProps> = ({ stockData }) => {
  if (!stockData) return null;
  
  const [activeTab, setActiveTab] = useState<string>('valuation');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'valuation':
        return <ValuationMeasures stockData={stockData} />;
      case 'analysis':
        return <AnalystsRecommendation stockData={stockData} />;
      case 'eps':
        return <EPSChart stockData={stockData} />;
      case 'pe':
        return <PeRatioChart stockData={stockData} />;
      case 'intrinsic':
        return <IntrinsicValue stockData={stockData} />;
      case 'defensive':
        return <BenjaminGraham stockData={stockData} investorType = "defensive"/>;
      case 'enterprising':
        return <BenjaminGraham stockData={stockData} investorType = "enterprising"/>;
      default:
        return null;
    }
  };

  return (
    <div className="stock-details__tab-content">
      <div className="stock-details__tabs">
        {['Valuation', 'Analysis', 'EPS', 'PE', 'Intrinsic', 'Defensive', 'Enterprising'].map((tab) => (
          <TabButton
            key={tab}
            label={tab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        ))}
      </div>
      <hr className="stock-details__analysts__divider" />
      {renderTabContent()}
    </div>
  );
};

export default TabContents;
