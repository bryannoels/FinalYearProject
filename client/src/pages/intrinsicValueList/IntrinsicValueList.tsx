import { useState, useEffect, useRef } from 'react';
import { fetchData, getCachedData, setCachedData } from '../../components/utils/utils';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';
import IntrinsicValueListItem from '../../components/intrinsicValueListItem/IntrinsicValueListItem';
import './IntrinsicValueList.css';

interface ValuationDataItem {
  [key: string]: any;
  'Stock Symbol': string;
  'Company Name': string;
  'Opening Price'?: number;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

interface IntrinsicValueResponse {
  data: ValuationDataItem[];
  pagination: PaginationInfo;
  retrievedAt: string;
}

function IntrinsicValueList() {
  const [sortBy, setSortBy] = useState('percent_average');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stockList, setStockList] = useState<ValuationDataItem[]>([]);
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);
  const [animateHeader, setAnimateHeader] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const sortOptions = {
    percent_average: 'Average Value',
    percent_dcf: 'DCF Value',
    percent_ddm: 'DDM Value',
    percent_graham: 'Benjamin Graham',
    percent_abs_average: 'Absolute Average',
    percent_abs_dcf: 'Absolute DCF',
    percent_abs_ddm: 'Absolute DDM',
    percent_abs_graham: 'Absolute Graham',
    beta: 'Beta',
    stddev: 'Standard Deviation'
  };

  const fetchStocks = async (sortByParam: string, pageParam: number) => {
    setLoading(true);
    try {
      const cacheKey = `intrinsic_value_sort-by-${sortByParam}_page-${pageParam}`;
      const cachedStocks = getCachedData(cacheKey);
      
      if (cachedStocks) {
        setStockList(cachedStocks.data.data);
        setDateTime(cachedStocks.timestamp);
        setTotalPages(cachedStocks.data.pagination.totalPages || 1);
      } else {
        const url = `http://localhost:8000/api/stocks/get-intrinsic-value-list?sortBy=${encodeURIComponent(sortByParam)}&page=${encodeURIComponent(pageParam)}`;
        const response = await fetchData(url);
        
        setStockList(response.data);
        setTotalPages(response.totalPages || 1);
        setDateTime(response.retrievedAt);
        
        const cachedValue: IntrinsicValueResponse = {
          data: response.data,
          pagination: {
            currentPage: response.currentPage || pageParam,
            totalPages: response.totalPages || 1,
            totalItems: response.totalItems || 0,
          },
          retrievedAt: response.retrievedAt
        };
        
        setCachedData(cacheKey, { 
          data: cachedValue, 
          timestamp: cachedValue.retrievedAt,
        });
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
    setShowFilter(false);
    
    setAnimateHeader(true);
    setTimeout(() => setAnimateHeader(false), 600);
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
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && 
          !(event.target as Element).closest('.filter-button')) {
        setShowFilter(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  useEffect(() => {
    fetchStocks(sortBy, page);
  }, [sortBy, page]);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15
    };
    
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const itemsToAnimate = entry.target.querySelectorAll('.value-card');
          itemsToAnimate.forEach((item, index) => {
            setTimeout(() => {
              item.classList.add('visible');
            }, index * 80);
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
  }, [stockList]);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;
    
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

  return (
    <div className="intrinsic-value-list">
      <div className={`intrinsic-value-header ${animateHeader ? 'pulse' : ''}`} ref={headerRef}>
        <h1>Intrinsic Value</h1>
        <div className="sort-label">
          <span>Sorting by:</span>
          <span className="current-sort">{sortOptions[sortBy as keyof typeof sortOptions]}</span>
        </div>
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
          <div className="sort-options">
            {Object.entries(sortOptions).map(([value, label]) => (
              <label key={value} className={`sort-option ${sortBy === value ? 'active' : ''}`}>
                <input 
                  type="radio" 
                  name="sort"
                  checked={sortBy === value}
                  onChange={() => handleSortChange(value)}
                />
                <span className="option-label">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="intrinsic-value-items" ref={listRef}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          stockList.length > 0 ? (
            stockList.map((stock: ValuationDataItem, index) => (
              <IntrinsicValueListItem 
                key={stock['Stock Symbol']}
                stock={stock}
                sortBy={sortBy}
                onClick={() => handleItemClick(stock['Stock Symbol'])} 
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

export default IntrinsicValueList;