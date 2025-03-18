import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Stock } from '../../types/Stock';
import { fetchStockDetails } from '../../components/stockDetails/fetchStockDetails';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import StockInfo from '../../components/stockDetails/stockInfo';
import StockPriceChart from '../../components/stockDetails/stockPriceChart/stockPriceChart';
import TabContents from '../../components/stockDetails/tabContents/tabContents';
import './StockDetails.css';

const StockDetails = () => {
    const { symbol } = useParams<{ symbol: string }>();
    if (!symbol) return null;

    const [loading, setLoading] = useState(true);
    const [_error, setError] = useState<string | null>(null);
    const [stockData, setStockData] = useState<Stock | null>(null);
    const [dateTime, setDateTime] = useState<string>('');

    useEffect(() => {
        if (!symbol) return;
        fetchStockDetails(symbol, setStockData, setLoading, setError, setDateTime);
    }, [symbol]);

    return (
        <div className="stock-details">
            {loading ? (
                <LoadingSpinner />
            ) : (
                <>
                    <StockInfo symbol={symbol} stockData={stockData} />
                    <StockPriceChart stockData={stockData}/>
                    <TabContents stockData={stockData} />
                    <div className="data-date-time">
                        Data is accurate as of <br /> <strong>{dateTime}</strong>
                    </div>
                </>
            )}
        </div>
    );
};

export default StockDetails;
