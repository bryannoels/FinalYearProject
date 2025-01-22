import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Stock } from '../../types/Stock';
import { fetchStockDetails } from '../../components/stockDetails/fetchStockDetails';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import StockInfo from '../../components/stockDetails/stockInfo';
import StockPriceChart from '../../components/stockDetails/stockPriceChart';
import ValuationMeasures from '../../components/stockDetails/valuationMeasures';
import AnalystsRecommendation from '../../components/stockDetails/analystsRecommendation';
import EPSChart from '../../components/stockDetails/epsChart';
import BenjaminGraham from '../../components/stockDetails/benjaminGraham';
import './StockDetails.css';

const StockDetails = () => {
    const { symbol } = useParams<{ symbol: string }>();
    if (!symbol) return null;

    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const [stockData, setStockData] = useState<Stock | null>(null);
    const [activeTab, setActiveTab] = useState<string>('valuation'); // Default tab


    useEffect(() => {
        if (!symbol) return;
        fetchStockDetails(symbol, setStockData, setLoading, setError);
    }, [symbol]);

    const tabItems = [
        {
            key: 'valuation',
            label: 'Valuation',
            children: <ValuationMeasures stockData={stockData} />,
        },
        {
            key: 'analysts',
            label: 'Analysts',
            children: <AnalystsRecommendation stockData={stockData} />,
        },
        {
            key: 'eps',
            label: 'EPS',
            children: <EPSChart stockData={stockData} />,
        },
        {
            key: 'graham',
            label: 'Graham',
            children: <BenjaminGraham stockData={stockData} />,
        },
    ];

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
        <div className="stock-details">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <StockInfo symbol={symbol} stockData={stockData} />
                    <StockPriceChart stockData={stockData} />
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
                </>
            )}
        </div>
    );
};

export default StockDetails;
