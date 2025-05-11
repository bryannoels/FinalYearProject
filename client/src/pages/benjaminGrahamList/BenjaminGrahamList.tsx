import { useState, useEffect, useRef } from 'react';
import { fetchData, getCachedData, setCachedData } from '../../components/utils/utils';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import BenjaminGrahamItem from '../../components/benjaminGrahamItem/BenjaminGrahamItem';
import { BenjaminGrahamStockInfo } from '../../types/BenjaminGrahamStockInfo';
import { BenjaminGrahamStockList } from '../../types/BenjaminGrahamStockList';
import { createBenjaminGrahamStockObject } from '../utils/utils';
import './BenjaminGrahamList.css';

const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api/stocks'
    : 'https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock';

function BenjaminGrahamList() {
  const [sortBy, setSortBy] = useState('Overall');
  const [filterBy, setFilterBy] = useState('0000000');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [marketStockList, setMarketStockList] = useState<BenjaminGrahamStockInfo[]>([]);
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchStocks = async (sortBy: string, filterBy: string, page: number) => {
    setLoading(true);
    try {
      const cacheKey = `stocks_sort-by-${sortBy}_filter-by-${filterBy}_page-${page}`;
      const cachedStocks = getCachedData(cacheKey);
      
      if (cachedStocks) {
        setMarketStockList(cachedStocks.data.data);
        setDateTime(cachedStocks.timestamp);
        setTotalPages(cachedStocks.data.pagination.totalPages || 1);
      } else {
        const url = `${API_BASE_URL}/get-benjamin-graham-list?sortBy=${encodeURIComponent(sortBy)}&filterBy=${encodeURIComponent(filterBy)}&page=${encodeURIComponent(page)}`;
        const response = await fetchData(url);
        const formattedData: BenjaminGrahamStockInfo[] = response.data.map(createBenjaminGrahamStockObject);
        
        const totalPages = response.pagination.totalPages || 1;
        setTotalPages(totalPages);

        const cachedValue: BenjaminGrahamStockList = {
          data: formattedData,
          pagination: {
            currentPage: response.pagination.currentPage || page,
            totalPages: totalPages,
            pageSize: response.pagination.pageSize || formattedData.length,
            totalItems: response.pagination.totalItems || 0,
            hasNextPage: response.pagination.hasNextPage || page < totalPages,
            hasPreviousPage: response.pagination.hasPreviousPage || page > 1
          },
          retrievedAt: response.retrievedAt
        };
        
        setCachedData(cacheKey, { 
          data: cachedValue, 
          timestamp: cachedValue.retrievedAt,
        });
        
        setMarketStockList(formattedData);
        setDateTime(cachedValue.retrievedAt);
      }
    } catch (error) {
      console.error("Error fetching stocks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (symbol: string) => {
    navigate(`/stock/${symbol}`);
  };

  const handleSortChange = (newSortValue: string) => {
    setSortBy(newSortValue);
    setPage(1);
  };

  const handleFilterChange = (index: number) => {
    const filterArray = filterBy.split('');
    filterArray[index] = filterArray[index] === '0' ? '1' : '0';
    setFilterBy(filterArray.join(''));
    setPage(1);
  };

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          !event.target.closest('.filter-button')) {
        setShowFilter(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    fetchStocks(sortBy, filterBy, page);
  }, [sortBy, filterBy, page]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

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
                const itemsToAnimate = entry.target.querySelectorAll('.benjamin-graham-card');
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
    <div className="benjamin-graham-list">
      <div className="benjamin-graham-header">
        <h1>Benjamin Graham</h1>
        <button 
          className={`filter-button ${showFilter ? 'active' : ''}`}
          onClick={toggleFilter}
        >
          <svg className="filter-icon" viewBox="0 0 24 24" width="24" height="24">
            <path d="M4 6h16M7 12h10M9 18h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Filter
        </button>
      </div>
      <div className={`filter-dropdown ${showFilter ? 'show' : ''}`} ref={dropdownRef}>
        <div className="filter-section">
          <h3>Sort by</h3>
          <div className="radio-options">
            <label className="radio-label">
              <input 
                type="radio" 
                name="sort" 
                checked={sortBy === 'Defensive'}
                onChange={() => handleSortChange('Defensive')}
              />
              Long Term Rule
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="sort" 
                checked={sortBy === 'Enterprising'}
                onChange={() => handleSortChange('Enterprising')}
              />
              Short Term Rule
            </label>
            <label className="radio-label">
              <input 
                type="radio" 
                name="sort" 
                checked={sortBy === 'Overall'}
                onChange={() => handleSortChange('Overall')}
              />
              Overall
            </label>
          </div>
        </div>
        
        <div className="filter-section">
          <h3>Filter by</h3>
          <div className="checkbox-grid">
            {['Total Revenue', 'Current Ratio', 'Earning Stability', 'Dividend Record', 'Earnings Growth', 'Price/Earnings Ratio', 'Price/Assets Ratio'].map((letter, index) => (
              <label key={letter} className="checkbox-label">
                <input 
                  type="checkbox" 
                  checked={filterBy[index] === '1'}
                  onChange={() => handleFilterChange(index)}
                />
                {letter}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="benjamin-graham-items">
        {loading ? (
          <LoadingSpinner />
        ) : (
          marketStockList.length > 0 ? (
            marketStockList.map((stock: BenjaminGrahamStockInfo, index) => (
              <BenjaminGrahamItem 
                key={stock.symbol}
                {...stock}
                sortBy={sortBy}
                onClick={() => handleItemClick(stock.symbol)} 
                animationDelay={index}
              />
            ))
          ) : (
            <div className="no-results">No stocks found matching your criteria</div>
          )
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-button pagination-arrow"
            onClick={() => handlePageChange(1)} 
            disabled={page === 1}
            aria-label="First page"
          >
            &laquo;
          </button>
          
          <button 
            className="pagination-button pagination-arrow"
            onClick={() => handlePageChange(page - 1)} 
            disabled={page === 1}
            aria-label="Previous page"
          >
            &lsaquo;
          </button>
          
          {getPageNumbers().map(num => (
            <button 
              key={num}
              className={`pagination-button ${page === num ? 'active' : ''}`}
              onClick={() => handlePageChange(num)}
              aria-label={`Page ${num}`}
              aria-current={page === num ? 'page' : undefined}
            >
              {num}
            </button>
          ))}
          
          <button 
            className="pagination-button pagination-arrow"
            onClick={() => handlePageChange(page + 1)} 
            disabled={page === totalPages}
            aria-label="Next page"
          >
            &rsaquo;
          </button>
          
          <button 
            className="pagination-button pagination-arrow"
            onClick={() => handlePageChange(totalPages)} 
            disabled={page === totalPages}
            aria-label="Last page"
          >
            &raquo;
          </button>
        </div>
      )}

      <div className="data-timestamp">
        Data is accurate as of <strong>{dateTime}</strong>
      </div>
    </div>
  );
}

export default BenjaminGrahamList;