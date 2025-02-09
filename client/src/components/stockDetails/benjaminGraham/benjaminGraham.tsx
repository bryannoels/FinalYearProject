import React, { useState } from 'react';
import { getDefensiveData, getEnterprisingData } from './benjaminGrahamData';
import { Stock } from '../../../types/Stock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';

interface BenjaminGrahamProps {
  stockData: Stock | null;
  investorType: "defensive" | "enterprising";
}

const BenjaminGraham: React.FC<BenjaminGrahamProps> = ({ stockData, investorType }) => {
  if (stockData == null) return null;

  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null);
  const data = investorType === "defensive" ? getDefensiveData(stockData) : getEnterprisingData(stockData);
  const handleMouseEnter = (label: string) => setHoveredLabel(label);
  const handleMouseLeave = () => setHoveredLabel(null);

  return (
    <>
      <p className="stock-details__title">
        {investorType === "defensive" ? "Defensive Investor" : "Enterprising Investor"}
      </p>
      <div className="stock-details__table">
        {Object.entries(data).map(([label, { value, description, color }]) => (
          <div className="stock-details__table__row" key={label}>
            <div className="stock-details__table__label">
              {label}
              <span
                className="info-icon"
                onMouseEnter={() => handleMouseEnter(label)}
                onMouseLeave={handleMouseLeave}
              >
                <FontAwesomeIcon icon={faCircleInfo} />
                {hoveredLabel === label && (
                  <div className="benjamin-graham__tooltip">
                    {description}
                  </div>
                )}
              </span>
            </div>
            <div className="stock-details__table__value" style={{ color: color }}>
              {value}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default BenjaminGraham;
