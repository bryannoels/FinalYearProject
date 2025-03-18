import { BenjaminGrahamStockInfo } from '../../types/BenjaminGrahamStockInfo';
import './BenjaminGrahamItem.css';

interface BenjaminGrahamItemProps extends BenjaminGrahamStockInfo {
    onClick: () => void;
    sortBy: string;
    animationDelay: number;
}

const BenjaminGrahamItem: React.FC<BenjaminGrahamItemProps> = ({ 
  symbol, 
  companyName, 
  defensiveValue, 
  enterprisingValue, 
  overallValue, 
  sortBy, 
  animationDelay = 0,
  onClick = () => {}
}) => {
    const displayValue = sortBy === 'Defensive' 
      ? defensiveValue
      : sortBy === 'Enterprising' 
        ? enterprisingValue
        : overallValue;
    
    const totalValue = sortBy === 'Defensive' || sortBy === 'Enterprising' 
      ? 7 
      : 14;
    
    // Calculate percentage for score visualization
    const scorePercentage = (displayValue / totalValue) * 100;
    
    // Determine color class based on score percentage
    const getScoreColorClass = () => {
      if (scorePercentage >= 75) return 'score-excellent';
      if (scorePercentage >= 50) return 'score-good';
      if (scorePercentage >= 25) return 'score-average';
      return 'score-poor';
    };
    
    return (
        <div className="benjamin-graham-card" style={{ animationDelay: `${animationDelay * 100}ms` }}>
            <div className="card-content" onClick={onClick}>
                <div className="stock-info">
                    <h3 className="company-name">{companyName}</h3>
                    <span className="stock-symbol">{symbol}</span>
                </div>
                
                <div className="score-display">
                    <div className={`score-circle ${getScoreColorClass()}`} 
                         style={{"--progress": `${scorePercentage}%`} as React.CSSProperties}>
                        <span className="score-value">{displayValue}</span>
                        <svg className="score-ring" viewBox="0 0 36 36">
                            {/* Circle path starts at top (12 o'clock position) */}
                            <path className="score-background"
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            {/* Progress starts at top and moves clockwise */}
                            <path className="score-progress"
                                  strokeDasharray={`${scorePercentage}, 100`}
                                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        </svg>
                    </div>
                    <span className="score-label">{sortBy} Score</span>
                    <span className="score-total">{displayValue} / {totalValue}</span>
                </div>
            </div>
            
            <div className="card-details">
                <div className="score-breakdown">
                    <div className="score-type">
                        <span className="type-label">Defensive</span>
                        <div className="progress-bar">
                            <div className="progress-fill defensive" 
                                 style={{"--width": `${(defensiveValue/7)*100}%`} as React.CSSProperties}></div>
                        </div>
                        <span className="type-score">{defensiveValue}/7</span>
                    </div>
                    <div className="score-type">
                        <span className="type-label">Enterprising</span>
                        <div className="progress-bar">
                            <div className="progress-fill enterprising" 
                                 style={{"--width": `${(enterprisingValue/7)*100}%`} as React.CSSProperties}></div>
                        </div>
                        <span className="type-score">{enterprisingValue}/7</span>
                    </div>
                    <div className="score-type">
                        <span className="type-label">Overall</span>
                        <div className="progress-bar">
                            <div className="progress-fill overall" 
                                 style={{"--width": `${(overallValue/14)*100}%`} as React.CSSProperties}></div>
                        </div>
                        <span className="type-score">{overallValue}/14</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BenjaminGrahamItem;