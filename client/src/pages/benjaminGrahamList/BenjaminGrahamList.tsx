import { CurrentMarket } from '../currentMarket/currentMarket';
import './BenjaminGrahamList.css';

function BenjaminGrahamList() {

  return (
    <div className="benjamin-graham-list">
      {/* <div className="dashboard__market__container">
          <p className="market__title">Current Market</p>
          <div className="market__search-box">
          <input
              type="text"
              className="dashboard__search"
              placeholder="Search stocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
          />
          {showSearchedStocks && searchStockResult.length > 0 && (
              <Dropdown
              suggestions={searchStockResult}
              dropdownRef={dropdownRef}
              onItemClick={handleItemClick}
              isOpen={showSearchedStocks}
              />
          )}
          </div>
      </div> */}
      {/* <CurrentMarket /> */}
    </div>
  );
}

export default BenjaminGrahamList;
