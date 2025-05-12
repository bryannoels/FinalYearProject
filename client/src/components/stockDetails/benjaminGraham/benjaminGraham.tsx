import React, { useState } from 'react';
import { getDefensiveData, getEnterprisingData } from './benjaminGrahamData';
import { Stock } from '../../../types/Stock';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo, faCheckCircle, faTimesCircle, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import './benjaminGraham.css';

interface BenjaminGrahamProps {
  stockData: Stock | null;
  investorType: "defensive" | "enterprising";
}

const BenjaminGraham: React.FC<BenjaminGrahamProps> = ({ stockData, investorType }) => {
  if (stockData == null) return null;

  const [expandedCards, setExpandedCards] = useState<string[]>([]);

  const data = investorType === "defensive" ? getDefensiveData(stockData) : getEnterprisingData(stockData);

  const toggleCardExpansion = (label: string) => {
    setExpandedCards(prev => {
      if (prev.includes(label)) {
        return prev.filter(item => item !== label);
      } else {
        return [...prev, label];
      }
    });
  };

  return (
    <div className="benjamin-graham-container">
      <div className="investor-type-header">
        <div className={`investor-badge ${investorType}`}>
          {investorType === "defensive" ? "Defensive Investor" : "Enterprising Investor"} Analysis
        </div>
        <p className="investor-description">
          {investorType === "defensive" ? "Criteria for conservative investors seeking quality companies" : "Criteria for value-seeking investors looking for undervalued opportunities"}
        </p>
      </div>

      <div className="criteria-cards">
        {Object.entries(data).map(([label, { value, description, color }]) => {
          const isExpanded = expandedCards.includes(label);
          const isPassed = color === 'green' || color === '#4caf50' || color === '#00a86b';
          const statusIcon = isPassed ? faCheckCircle : faTimesCircle;

          return (
            <div className="criteria-card" key={label}>
              <div className="card-header">
                <div className="card-title">
                  <span className="status-icon">
                    <FontAwesomeIcon icon={statusIcon} />
                  </span>
                  <h3>{label}</h3>
                </div>
                <div className="card-actions">
                  <div className={`card-value ${isPassed ? 'passed' : 'failed'}`} title={value}>
                    {value}
                  </div>
                  <button
                    className={`expand-button ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCardExpansion(label)}
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    <FontAwesomeIcon icon={faChevronDown} />
                  </button>
                </div>
              </div>

              <div className={`card-content ${isExpanded ? 'expanded' : ''}`}>
                {isExpanded && (
                  <div className="criteria-description">
                    <FontAwesomeIcon icon={faCircleInfo} className="info-icon" />
                    <p>{description}</p>
                  </div>
                )}
              </div>

              <div
                className={`progress-bar ${isPassed ? 'passed' : 'failed'}`}
                style={{ width: isPassed ? '100%' : '30%' }}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BenjaminGraham;
