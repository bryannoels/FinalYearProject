import React from 'react';
import './Dropdown.css';

interface DropdownProps {
  suggestions: { ticker: string; name: string }[];
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  portfolioName?: string;
  onItemClick: (symbol: string, portfolioName?: string) => void;
  isOpen: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ suggestions, dropdownRef, portfolioName, onItemClick, isOpen }) => {
  return (
    <div data-testid="dropdown" className={`search-suggestions ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      {suggestions.length === 0 ? (
        <div className="search-suggestion-item not-found">
          <p>Not Found</p>
        </div>
      ) : (
        suggestions.map((suggestion) => (
          <div
            key={suggestion.ticker}
            className="search-suggestion-item"
            onClick={() => portfolioName ? onItemClick(suggestion.ticker, portfolioName) : onItemClick(suggestion.ticker)}
          >
            <div className="dashboard__dropdown-item__ticker">
              {suggestion.ticker}
            </div>
            <div className="dashboard__dropdown-item__company-name">
              {suggestion.name}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dropdown;
