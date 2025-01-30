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
  if (stockData == null) return null;
  
  const [activeTab, setActiveTab] = useState<string>('valuation');

  const isTabValid = (tab: string) => {
    switch (tab.toLowerCase()) {
      case 'valuation':
        return stockData.detail !== null;
      case 'analysis':
        return stockData.analysis !== null || stockData.forecast !== null;
      case 'eps':
        return stockData.eps && stockData.eps.length > 0;
      case 'pe':
        return stockData.peRatio && stockData.peRatio.length > 0;
      case 'intrinsic':
        return (
          stockData.eps &&
          stockData.eps.length > 0 &&
          !isNaN(Number(stockData.growthRate)) &&
          !isNaN(Number(stockData.bondYield))
        );
      case 'defensive':
      case 'enterprising':
        return stockData !== null;
      default:
        return false;
    }
  };

  const validTabs = ['Valuation', 'Analysis', 'EPS', 'PE', 'Intrinsic', 'Defensive', 'Enterprising'].filter(isTabValid);

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
        return <BenjaminGraham stockData={stockData} investorType="defensive" />;
      case 'enterprising':
        return <BenjaminGraham stockData={stockData} investorType="enterprising" />;
      default:
        return null;
    }
  };

  return (
    <div className="stock-details__tab-content">
      <div className="stock-details__tabs">
        {validTabs.map((tab) => (
          <TabButton key={tab} label={tab} activeTab={activeTab} setActiveTab={setActiveTab} />
        ))}
      </div>
      <hr className="stock-details__analysts__divider" />
      {renderTabContent()}
    </div>
  );
};

export default TabContents;
