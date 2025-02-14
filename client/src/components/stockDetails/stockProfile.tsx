import React, { useState } from 'react';
import { Stock } from '../../types/Stock';


interface StockProfileProps {
  stockData: Stock | null;
}

const StockProfile: React.FC<StockProfileProps> = ({ stockData }) => {
    if (stockData == null || stockData.profile == null) return null;
    const [expanded, setExpanded] = useState(false);
    const summary = stockData?.profile.longBusinessSummary || "";
    const previewLength = 200;
    const isLong = summary.length > previewLength;
    //stockData.profile = typeof stockData.profile === 'string' ? JSON.parse(stockData.profile) : stockData.profile;

    const labels = {
        "Sector": stockData?.profile?.sector,
        "Industry": stockData?.profile?.industry,
        "Country": stockData?.profile?.country,
        "City":  [stockData?.profile?.city, stockData?.profile?.state].filter(Boolean).join(", "),
        "Address": stockData?.profile?.address,
        "Phone": stockData?.profile?.phone,
        "CEO": stockData?.profile?.CEO,
        "No. of Employees": stockData?.profile?.fullTimeEmployees,
    };

    return (
        <>
            <p className="stock-details__title">Profile</p>
            <div className="stock-details__table">
                {Object.entries(labels).filter(([_, value]) => value != null).map(([label, value]) => (
                    <div className="stock-details__table__row" key={label}>
                        <div className="stock-details__table__label">{label}</div>
                        <div className="stock-details__table__value">{value}</div>
                    </div>
                ))}
                <div className="stock-details__table__row" key="Website">
                    <div className="stock-details__table__label">Website</div>
                    <a href={stockData?.profile.website} target="_blank">
                        <div className="stock-details__table__value">{stockData?.profile.website.replace(/^(https:\/\/)/,"")}</div>
                    </a>
                </div>
            </div>

            <p className="stock-profile__description-title">{stockData?.profile.companyName}</p>
            <p className="stock-profile__description">
                {isLong && !expanded ? `${summary.slice(0, previewLength)}...` : summary}
                {isLong && (
                    <button onClick={() => setExpanded(!expanded)} className="view-more-button">
                        {expanded ? "View Less" : "View More"}
                    </button>
                )}
            </p>
        </>
    );
};

export default StockProfile;
