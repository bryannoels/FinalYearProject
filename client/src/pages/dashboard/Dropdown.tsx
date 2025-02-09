import React from 'react';

interface DropdownProps {
  suggestions: { ticker: string; name: string }[];
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  onItemClick: (symbol: string) => void;
  isOpen: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ suggestions, dropdownRef, onItemClick, isOpen }) => {
  console.log(suggestions.length)
  return (
    <div className={`search-suggestions ${isOpen ? 'open' : ''}`} ref={dropdownRef}>
      {suggestions.length === 0 ? (
        <div className="search-suggestion-item not-found">
          <p>Not Found</p>
        </div>
      ) : (
        suggestions.map((suggestion) => (
          <div
            key={suggestion.ticker}
            className="search-suggestion-item"
            onClick={() => onItemClick(suggestion.ticker)}
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
