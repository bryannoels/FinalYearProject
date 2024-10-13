import { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { useParams } from 'react-router-dom';
import DashboardItem from '../../components/dashboardItem/dashboardItem';
import { Stock } from '../../types/stocks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faSearch } from '@fortawesome/free-solid-svg-icons';
import './StockDetails.css';


type StockDetail = {
  name: string;
  symbol: string;
  currentPrice: number;
  priceChange: number;
  percentChange: number;
  volume: string;
  marketCap: string;
  eps: string;
  peRatio: string;
  dividendYield: string;
};

const StockDetails = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const currentStock: Stock = {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        price: 149.15,
        change: -0.41,
        percentChange: -0.27
    }
    const currentStockDetail: StockDetail = {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        currentPrice: 149.15,
        priceChange: -0.41,
        percentChange: -0.27,
        volume: '72.8M',
        marketCap: '2.5T',
        eps: '5.1',
        peRatio: '29.3',
        dividendYield: '0.58%'
    };

    return(
        <div className = "stock-details">
            <div className = "stock-details__top">
                <div className = "stock-details__top__head">
                    <button className="stock-details__back" onClick={() => window.history.back()}>
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true"/>
                    </button>
                    <div className = "stock-details__name">
                        {currentStockDetail.symbol}
                    </div>
                </div>
                <DashboardItem key={currentStock.symbol} {...currentStock} />
            </div>
            <div className = "stock-details__chart">
                
            </div>
            <div className = "stock-details__table">
                
            </div>
            <div className = "stock-details__verdict">
                
            </div>
            <div className = "stock-details__recommendation">
                
            </div>
        </div>
    );
};

export default StockDetails;
