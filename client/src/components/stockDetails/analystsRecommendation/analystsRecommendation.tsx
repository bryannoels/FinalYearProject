import React, { useEffect, useRef } from 'react';
import { Stock } from '../../../types/Stock';
import StockVerdict from './stockVerdict';
import StockForecast from './stockForecast';
import StockRatings from './stockRatings';
import './analystsRecommendation.css';

interface AnalystsRecommendationProps {
  stockData: Stock | null;
}

const AnalystsRecommendation: React.FC<AnalystsRecommendationProps> = ({ stockData }) => {
    const verdictRef = useRef<HTMLDivElement>(null);
    const forecastRef = useRef<HTMLDivElement>(null);
    const ratingsRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });
        
        if (verdictRef.current) observer.observe(verdictRef.current);
        if (forecastRef.current) observer.observe(forecastRef.current);
        if (ratingsRef.current) observer.observe(ratingsRef.current);
        
        return () => observer.disconnect();
    }, [stockData]);
    
    if (stockData == null) return null;
    
    return (
        <>
            { stockData.analysis || stockData.forecast ? 
                <p className="stock-details__title">Analysts' Recommendations</p> : null }
            <div className="stock-details__recommendation">
                {stockData.analysis && (
                    <div ref={verdictRef} className="section-wrapper">
                        <StockVerdict stockData={stockData} />
                    </div>
                )}
                
                {stockData.forecast && (
                    <div ref={forecastRef} className="section-wrapper">
                        <StockForecast stockData={stockData} />
                    </div>
                )}
                
                {stockData.analysis?.ratings?.length && stockData.analysis?.ratings?.length > 0 && (
                    <div ref={ratingsRef} className="section-wrapper">
                        <hr className="stock-details__analysts__divider" />
                        <p className="stock-details__analysts__rating__title">Analysts' Ratings</p>
                        <StockRatings stockData={stockData} />
                    </div>
                )}
            </div>
        </>
    );
};

export default AnalystsRecommendation;