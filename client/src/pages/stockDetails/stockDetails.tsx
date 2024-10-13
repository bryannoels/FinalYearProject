import { useParams } from 'react-router-dom';
import DashboardItem from '../../components/dashboardItem/dashboardItem';
import { Stock } from '../../types/stocks';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import './StockDetails.css';


type StockDetail = {
    companyName: string;
    currentPrice: string;
    openingPrice: string;
    previousClose: string;
    daysRange: string;
    week52Range: string;
    volume: string;
    marketCap: string;
    peRatio: string;
    eps: string;
    priceSales: string;
    priceBook: string;
  };
  

const StockDetails = () => {
    const { symbol } = useParams<{ symbol: string }>();
    const currentStock: Stock = {
        name: 'Apple Inc.',
        symbol: 'AAPL',
        price: 149.15,
        change: -0.41,
        percentChange: -0.27
    }
    const currentStockDetail: StockDetail = {
        companyName: "Alphabet Inc.",
        currentPrice: "163.24",
        openingPrice: "162.13",
        previousClose: "162.08",
        daysRange: "161.24 - 163.90",
        week52Range: "120.21 - 191.75",
        volume: "15,279,647",
        marketCap: "2.017T",
        peRatio: "23.42",
        eps: "6.97",
        priceSales: "6.26",
        priceBook: "6.68"
      };

      const labels = {
        "Opening Price": currentStockDetail.openingPrice,
        "Previous Close": currentStockDetail.previousClose,
        "Day's Range": currentStockDetail.daysRange,
        "52-Week Range": currentStockDetail.week52Range,
        "Volume": currentStockDetail.volume,
        "Market Cap": currentStockDetail.marketCap,
        "PE Ratio (TTM)": currentStockDetail.peRatio,
        "EPS (TTM)": currentStockDetail.eps,
        "Price/Sales (TTM)": currentStockDetail.priceSales,
        "Price/Book (MRQ)": currentStockDetail.priceBook,
      };

    return(
        <div className = "stock-details">
            <div className = "stock-details__top">
                <div className = "stock-details__top__head">
                    <button className="stock-details__back" onClick={() => window.history.back()}>
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true"/>
                    </button>
                    <div className = "stock-details__name">
                        {symbol}
                    </div>
                </div>
                <DashboardItem key={currentStock.symbol} {...currentStock} />
            </div>
            <div className = "stock-details__chart">

            </div>
            <p className="stock-details__title">Valuation measures</p>
            <div className = "stock-details__table">
                {Object.entries(labels).map(([label, value]) => (
                    <div className="stock-details__table__row" key={label}>
                        <div className="stock-details__table__label">{label}</div>
                        <div className="stock-details__table__value">{value}</div>
                    </div>
                ))}
            </div>
            <div className = "stock-details__verdict">
                
            </div>
            <div className = "stock-details__recommendation">
                
            </div>
        </div>
    );
};

export default StockDetails;
