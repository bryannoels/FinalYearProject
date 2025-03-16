import React, { useEffect, useRef } from 'react';
import { StockInfo } from '../../types/StockInfo';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import './currentMarket.css';

interface CurrentMarketProps {
    marketStockList: StockInfo[];
    loading: boolean;
    handleItemClick: (symbol: string) => void;
}

export const CurrentMarket: React.FC<CurrentMarketProps> = ({ marketStockList, loading, handleItemClick }) => { 
    const listRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        // Set up intersection observer for scroll animations
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const handleIntersection = (entries: IntersectionObserverEntry[]) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const itemsToAnimate = entry.target.querySelectorAll('.dashboard__item');
                    itemsToAnimate.forEach((item, index) => {
                        setTimeout(() => {
                            item.classList.add('visible');
                        }, index * 100); // Stagger the animations
                    });
                }
            });
        };
        
        const observer = new IntersectionObserver(handleIntersection, observerOptions);
        
        if (listRef.current) {
            observer.observe(listRef.current);
        }
        
        return () => {
            observer.disconnect();
        };
    }, [marketStockList]);

    return (
        <div className="current-market" ref={listRef}>
             <div className="market-divider" />
            
            {loading ? (
                <div className="loading-container">
                    <LoadingSpinner />
                </div>
            ) : (
                <div className="market-items-container">
                    {marketStockList.map((stock: StockInfo, index) => (
                        <DashboardItem 
                            key={stock.symbol} 
                            {...stock} 
                            onClick={() => handleItemClick(stock.symbol)}
                            animationDelay={index}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}