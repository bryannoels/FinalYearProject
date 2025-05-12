import { useState } from 'react';
import { fetchPortfolioData } from '../../pages/utils/fetchData';
import './aiRecommendation.css';
import CustomDialogBox from '../../components/customDialogBox/CustomDialogBox';
import LoadingSpinner from '../../components/loadingSpinner/LoadingSpinner';

type Recommendation = {
  stock_symbol: string;
  company_name: string;
  reasons: string[];
};

const API_BASE_URL = process.env.NODE_ENV === 'development'
    ? 'http://localhost:8000/api/stocks'
    : 'https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/stock';

function AIRecommendation() {
  const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  const [riskLevel, setRiskLevel] = useState('low');
  const [sector, setSector] = useState('Technology');
  const [horizon, setHorizon] = useState('Short Term (<2 years)');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
  const [userPortfolioList, setUserPortfolioList] = useState<string[]>([]);
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"add" | "removeStock" | "removePortfolio" | "prompt">("add");
  const [promptMessage, setPromptMessage] = useState<string>("");
  const [isConfirmDisabled, setConfirmDisabled] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<{ name: string; symbol: string } | null>(null);
  const [screenLoading, setScreenLoading] = useState<boolean>(false);

  const displayDialogPrompt = (message: string) => {
    setDialogOpen(false);
    setDialogType("prompt");
    setPromptMessage(message);
    setConfirmDisabled(false);
    setDialogOpen(true);
  }

  const openAddDialog = async (stockName: string, symbol: string) => {
    if (authToken) {
      setSelectedPortfolio("");
      const userPortfolio = await fetchPortfolioData(authToken);
      let userPortfolioList = Object.keys(userPortfolio);
      setUserPortfolioList(userPortfolioList);

      if (userPortfolio == null || userPortfolio.length === 0) {
          displayDialogPrompt("You must create a portfolio first.");
          return;
      }
    } else {
      displayDialogPrompt("You must login to add stock to your portfolio.");
      return;
    }

    setSelectedStock({ name: stockName, symbol });
    setDialogType("add");
    setConfirmDisabled(true);
    setDialogOpen(true);
  };

  const handlePortfolioChange = (portfolioName: string) => {
    setSelectedPortfolio(portfolioName);
    portfolioName == "" ? setConfirmDisabled(true) : setConfirmDisabled(false);
  };

  const handleConfirm = async () => {
        if (dialogType === "add") {
            setScreenLoading(true);
            try {
                const payload = {
                    method: 'addStock',
                    data: {
                        portfolioName: selectedPortfolio,
                        stockSymbol: selectedStock!.symbol,
                    },
                };

                await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
                }).catch((error) => displayDialogPrompt('Server error: ' + error));
            } catch (error) {
                displayDialogPrompt('Error adding stock to portfolio:' + error);
            } finally {
                setScreenLoading(false);
            }
            displayDialogPrompt("The stock has been added to the portfolio.");
        } else {
            setDialogOpen(false);
        }
    }

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const queryParams = new URLSearchParams({
        risk_level: riskLevel,
        sector: sector,
        horizon: horizon
      }).toString();

      const response = await fetch(`${API_BASE_URL}/get-ai-recommendation?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Recommendation service not found (404). Please try again later.');
        } else {
          throw new Error(`Something went wrong (status ${response.status}).`);
        }
      }
      const data = await response.json();
      console.log('data:', data);
      setRecommendations(data.body.recommendations);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="recommend-stocks-page">
        <div className="AI-recommend-form">
          <h1>AI Stock Recommendations</h1>
          <div className="AI-recommend-form-body">
            <div className="AI-recommend-form-risk-level">
              <label>Risk level:</label>
              <select className="AI-recommend-form-dropdowns" value={riskLevel} onChange={(e) => setRiskLevel(e.target.value)}>
                <option className="AI-recommend-form-dropdown-options" value="Low Risk">Low Risk</option>
                <option className="AI-recommend-form-dropdown-options" value="Moderate Risk">Moderate Risk</option>
                <option className="AI-recommend-form-dropdown-options" value="High Risk">High Risk</option>
              </select>
            </div>
            <div className="AI-recommend-form-sector">
              <label>Sector:</label>
              <select className="AI-recommend-form-dropdowns" value={sector} onChange={(e) => setSector(e.target.value)}>
                <option className="AI-recommend-form-dropdown-options" value="Technology">Technology</option>
                <option className="AI-recommend-form-dropdown-options" value="Healthcare">Healthcare</option>
                <option className="AI-recommend-form-dropdown-options" value="Communication Services">Communication Services</option>
                <option className="AI-recommend-form-dropdown-options" value="Finance">Finance</option>
                <option className="AI-recommend-form-dropdown-options" value="Energy">Energy</option>
                <option className="AI-recommend-form-dropdown-options" value="Consumer Goods">Consumer Goods</option>
                <option className="AI-recommend-form-dropdown-options" value="Any">Any</option>
              </select>
            </div>
            <div className="AI-recommend-form-horizon">
              <label>Horizon:</label>
              <select className="AI-recommend-form-dropdowns" value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                <option className="AI-recommend-form-dropdown-options" value="Short Term (<2 years)">Short Term (&lt;2 years)</option>
                <option className="AI-recommend-form-dropdown-options" value="Medium Term (2-5 years)">Medium Term (2-5 years)</option>
                <option className="AI-recommend-form-dropdown-options" value="Long Term (>5 years)">Long Term (&gt;5 years)</option>
              </select>
            </div>
          </div>
          <button className="AI-recommend-form-submit" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Get Recommendations'}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="recommendations">
          {recommendations.map((rec, index) => (
            <div key={index} className="recommended-stocks-card green">
              <div className="card-content">
                <div className="stock-info">
                  <div className="stock-symbol">{rec.stock_symbol}</div>
                  <div className="company-name">{rec.company_name}</div>
                </div>
                <button className="recommended-stocks-add-to-portfolio" onClick={() => openAddDialog(rec.company_name || "", rec.stock_symbol)}>
                  Add to Portfolio
                </button>
              </div>

              <div className="recommended-reasons">
                {rec.reasons.map((reason, idx) => (
                  <div key={idx} className="reason-point">• {reason}</div>
                ))}
              </div>

              <div className="card-ripple"></div>
            </div>
          ))}
        </div>
        {screenLoading ? (
            <>
                <div className="stock-details__loading-overlay">
                    <LoadingSpinner />
                </div>
            </>
        ) : (
            <CustomDialogBox
                isOpen={isDialogOpen}
                dialogType={dialogType}
                promptMessage={promptMessage}
                stockName={selectedStock?.name}
                stockSymbol={selectedStock?.symbol}
                portfolioNames={userPortfolioList}
                selectedPortfolio={selectedPortfolio}
                isConfirmDisabled={isConfirmDisabled}
                onPortfolioChange={handlePortfolioChange}
                onConfirm={handleConfirm}
                onCancel={() => setDialogOpen(false)}
            />
        )}
      </div>
  </>
  );
};

export default AIRecommendation;