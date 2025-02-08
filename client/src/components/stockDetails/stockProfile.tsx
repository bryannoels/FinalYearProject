import React from 'react';
import { Stock } from '../../types/Stock';


interface StockProfileProps {
  stockData: Stock | null;
}

const StockProfile: React.FC<StockProfileProps> = ({ stockData }) => {
    if (stockData == null || stockData.profile == null) return null;

    const labels = {
        "Sector": stockData?.profile?.sector,
        "Industry": stockData?.profile?.industry,
        "Country": stockData?.profile?.country,
        "City":  [stockData?.profile?.city, stockData?.profile?.state].filter(Boolean).join(", "),
        "Address": stockData?.profile?.address,
        "Phone": stockData?.profile?.phone,
        "Website": stockData?.profile?.website,
        "CEO": stockData?.profile?.CEO,
        "Number of Employees": stockData?.profile?.fullTimeEmployees,
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
            </div>
            <p className="stock-profile__description-title">{stockData?.profile.companyName}</p>
            <p className="stock-profile__description">{stockData?.profile.longBusinessSummary}</p>
        </>
    );
};

export default StockProfile;
