import React, { useState } from 'react';
import { Stock } from '../../types/Stock';
import ValuationMeasures from './valuationMeasures';
import AnalystsRecommendation from './analystsRecommendation';
import EPSChart from './epsChart';
import BenjaminGraham from './benjaminGraham';

interface TabContentsProps {
  stockData: Stock | null;
}

const TabContents: React.FC<TabContentsProps> = ({ stockData }) => {
    const [activeTab, setActiveTab] = useState<string>('valuation');
    
    const renderTabContent = () => {
        switch (activeTab) {
            case 'valuation':
                return <ValuationMeasures stockData={stockData} />;
            case 'analysts':
                return <AnalystsRecommendation stockData={stockData} />;
            case 'eps':
                return <EPSChart stockData={stockData} />;
            case 'graham':
                return <BenjaminGraham stockData={stockData} />;
            default:
                return null;
        }
    };

    return (
        <div className="stock-details__tab-content">
            <div className="stock-details__tabs">
                <button
                    className={`stock-details__tab ${
                        activeTab === 'valuation' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('valuation')}
                >
                    Valuation
                </button>
                <button
                    className={`stock-details__tab ${
                        activeTab === 'analysts' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('analysts')}
                >
                    Analysts
                </button>
                <button
                    className={`stock-details__tab ${
                        activeTab === 'eps' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('eps')}
                >
                    EPS
                </button>
                <button
                    className={`stock-details__tab ${
                        activeTab === 'graham' ? 'active' : ''
                    }`}
                    onClick={() => setActiveTab('graham')}
                >
                    Graham
                </button>
            </div>
            <hr className = "stock-details__analysts__divider" />
            {renderTabContent()}
        </div>
    );
};

export default TabContents;
