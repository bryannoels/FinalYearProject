import React, { useState, useEffect, useRef } from 'react';
import { Stock } from '../../../types/Stock';
import './stockProfile.css';

interface StockProfileProps {
  stockData: Stock | null;
}

const StockProfile: React.FC<StockProfileProps> = ({ stockData }) => {
  if (stockData == null || stockData.profile == null) return null;

  const [expanded, setExpanded] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [animateItems, setAnimateItems] = useState(false);

  const summary = stockData?.profile.longBusinessSummary || "";
  const previewLength = 200;
  const isLong = summary.length > previewLength;
  const labels = {
    "Sector": stockData?.profile?.sector,
    "Industry": stockData?.profile?.industry,
    "Country": stockData?.profile?.country,
    "City": [stockData?.profile?.city, stockData?.profile?.state].filter(Boolean).join(", "),
    "Address": stockData?.profile?.address,
    "Phone": stockData?.profile?.phone,
    "CEO": stockData?.profile?.CEO,
    "No. of Employees": stockData?.profile?.fullTimeEmployees,
  };

  const [logoLoaded, setLogoLoaded] = useState(false);
  const logoPath = `/stockLogos/${stockData.info.symbol}.png`;

  useEffect(() => {
    const img = new Image();
    img.src = logoPath;
    img.onload = () => setLogoLoaded(true);
    img.onerror = () => setLogoLoaded(false);
  }, [logoPath]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Delay the animation of items for a staggered effect
          setTimeout(() => {
            setAnimateItems(true);
          }, 300);
        } else {
          setIsVisible(false);
          setAnimateItems(false);
        }
      },
      { threshold: 0.1 }
    );
  
    if (profileRef.current) {
      observer.observe(profileRef.current);
    }
  
    return () => {
      if (profileRef.current) {
        observer.unobserve(profileRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      ref={profileRef} 
      className={`stock-profile-container ${isVisible ? 'visible' : ''}`}
    >
      <div className="company-card">
        <div className="company-header">
          {logoLoaded ? (
            <div className="company-logo">
              <img src={logoPath} alt={`${stockData.info.symbol} logo`} />
            </div>
          ) : (
            <div className="company-icon-wrapper">
              <div className="company-icon">{stockData?.profile.companyName.charAt(0)}</div>
            </div>
          )}
          <div className="company-info">
            <h2 className="company-name">{stockData?.profile.companyName}</h2>
            <span className="company-ticker">{stockData?.info.symbol}</span>
          </div>
        </div>

        <div className="section-title">
          <h3>Company Overview</h3>
          <div className="section-divider"></div>
        </div>
        
        <div className="company-description-container">
          <p className={`company-description ${expanded ? 'expanded' : ''}`}>
            {isLong && !expanded ? `${summary.slice(0, previewLength)}... ` : summary}
          </p>
          {isLong && (
            <button 
              onClick={() => setExpanded(!expanded)} 
              className="view-more-button"
            >
              {expanded ? "View Less" : "View More"}
              <span className={`arrow-icon ${expanded ? 'up' : 'down'}`}></span>
            </button>
          )}
        </div>

        <div className="section-title">
          <h3>Details</h3>
          <div className="section-divider"></div>
        </div>

        <div className={`details-container ${animateItems ? 'animate' : ''}`}>
          {Object.entries(labels)
            .filter(([_, value]) => value != null)
            .map(([label, value], index) => (
              <div 
                className="detail-item" 
                key={label}
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                <div className="detail-label">{label}</div>
                <div className="detail-value">{value}</div>
              </div>
            ))
          }
          
          {stockData?.profile.website && (
            <div className="detail-item website-item" style={{ animationDelay: `${Object.keys(labels).length * 0.08}s` }}>
              <div className="detail-label">Website</div>
              <a href={stockData.profile.website} target="_blank" rel="noopener noreferrer" className="website-link">
                <div className="detail-value website-value">
                  {stockData.profile.website.replace(/^(https?:\/\/)/,"")}
                  <span className="external-link-icon"></span>
                </div>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockProfile;