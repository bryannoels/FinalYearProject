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

      const currentVerdict = {
        verdict: "BUY",
        count: {
            positive: 3,
            neutral: 2,
            negative: 1
        }
      }

      const verdictClass =
        currentVerdict.verdict === "BUY" ? "buy" :
        currentVerdict.verdict === "HOLD" ? "hold" :
        currentVerdict.verdict === "SELL" ? "sell" :
        "";

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
            <p className="stock-details__title">Valuation Measures</p>
            <div className = "stock-details__table">
                {Object.entries(labels).map(([label, value]) => (
                    <div className="stock-details__table__row" key={label}>
                        <div className="stock-details__table__label">{label}</div>
                        <div className="stock-details__table__value">{value}</div>
                    </div>
                ))}
            </div>
            <p className="stock-details__title">Analysts' Recommendation</p>
            <div className = "stock-details__verdict">
                <div className = "stock-detailss__verdict__left">
                    <p className = {`stock-detailss__verdict__left__text ${verdictClass}`}>{currentVerdict.verdict}</p>
                </div>
                <div className = "stock-detailss__verdict__right">
                    <div className = "stock-detailss__verdict__positive">
                        <div className = "stock-detailss__verdict__value">{currentVerdict.count.positive}</div>
                        <div className = "stock-detailss__verdict__text">positive</div>
                    </div>
                    <div className = "stock-detailss__verdict__neutral">
                        <div className = "stock-detailss__verdict__value">{currentVerdict.count.neutral}</div>
                        <div className = "stock-detailss__verdict__text">neutral</div>
                    </div>
                    <div className = "stock-detailss__verdict__negative">
                        <div className = "stock-detailss__verdict__value">{currentVerdict.count.negative}</div>
                        <div className = "stock-detailss__verdict__text">negative</div>
                    </div>
                </div>
            </div>
            <div className = "stock-details__recommendation">
                
            </div>
        </div>
    );
};

export default StockDetails;
