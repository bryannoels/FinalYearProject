import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Stock } from '../../types/Stock';
import { fetchStockDetails } from '../../components/stockDetails/fetchStockDetails';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import StockInfo from '../../components/stockDetails/stockInfo';
import StockPriceChart from '../../components/stockDetails/stockPriceChart';

import './StockDetails.css';
import TabContents from '../../components/stockDetails/tabContents';

const StockDetails = () => {
    const { symbol } = useParams<{ symbol: string }>();
    if (!symbol) return null;

    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const [stockData, setStockData] = useState<Stock | null>(null);

    useEffect(() => {
        if (!symbol) return;
        fetchStockDetails(symbol, setStockData, setLoading, setError);
    }, [symbol]);

    return (
        <div className="stock-details">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <StockInfo symbol={symbol} stockData={stockData} />
                    <StockPriceChart stockData={stockData} />
                    <TabContents stockData={stockData} />
                </>
            )}
        </div>
    );
};

export default StockDetails;
