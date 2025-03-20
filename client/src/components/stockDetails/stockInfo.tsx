import React, { useState } from 'react';
import { Stock } from '../../types/Stock';
import { useNavigate } from 'react-router-dom';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { fetchPortfolioData } from '../../pages/utils/fetchData';
import CustomDialogBox from '../../components/CustomDialogBox/CustomDialogBox';

interface StockInfoProps {
    symbol: string,
    stockData: Stock | null;
}



const StockInfo: React.FC<StockInfoProps> = ({ symbol, stockData }) => {
    if (symbol == null || stockData == null) return null;
    const navigate = useNavigate();
    
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"add" | "removeStock" | "removePortfolio" | "prompt">("add");
    const [promptMessage, setPromptMessage] = useState<string>("");
    const [selectedStock, setSelectedStock] = useState<{ name: string; symbol: string } | null>(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
    const [userPortfolioList, setUserPortfolioList] = useState<string[]>([]);
    const [isConfirmDisabled, setConfirmDisabled] = useState<boolean>(true);
    const [screenLoading, setScreenLoading] = useState<boolean>(true);
    
    const openAddDialog = async (stockName: string, symbol: string) => {
        if (authToken) {
            setSelectedPortfolio("");
            const userPortfolio = await fetchPortfolioData(authToken);
            let userPortfolioList = Object.keys(userPortfolio);
            setUserPortfolioList(userPortfolioList);

            if (userPortfolio == null || userPortfolio.length === 0) {
                setDialogType("prompt");
                setPromptMessage("You need to create a portfolio first.");
                setConfirmDisabled(false);
                setDialogOpen(true);
                return;
            }
        } else {
            setDialogType("prompt");
            setPromptMessage("You need to login to add stock to your portfolio.");
            setConfirmDisabled(false);
            setDialogOpen(true);
            return;
        }

        setSelectedStock({ name: stockName, symbol });
        setDialogType("add");
        setConfirmDisabled(true);
        setDialogOpen(true);
      };
    
    const handlePortfolioChange = (portfolioName: string) => {
        console.log(portfolioName);
        setSelectedPortfolio(portfolioName);
        setConfirmDisabled(false);
    };

    const handleConfirm = async () => {
        if (dialogType === "add") {
            setScreenLoading(true);
        
            try {
                const payload = {
                method: 'addStock',
                data: {
                    portfolioName: selectedPortfolio,
                    stockSymbol: symbol,
                },
                };

                await fetch('https://dbvvd06r01.execute-api.ap-southeast-1.amazonaws.com/api/user/portfolio', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(payload),
                }).catch((error) => console.error('Server error: ', error));
            } catch (error) {
                //TO-DO: Refactor error dialog box into function with param message
                console.error('Error adding stock to portfolio:', error);
            } finally {
                setScreenLoading(false);
            }
            setDialogOpen(false);

            setDialogType("prompt");
            setPromptMessage("The stock has been added to the portfolio.");
            setConfirmDisabled(false);
            setDialogOpen(true);
        } else {
            setDialogOpen(false);
        }
    }

    return (
        <>
            <div className="stock-details__top">
                <div className="stock-details__top__head">
                    <button className="stock-details__back" onClick={() => navigate(-1)}>
                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                    </button>
                    <div className="stock-details__name">
                        {symbol}
                    </div>
                    <button className="stock-details__add-to-portfolio" onClick={() => openAddDialog(stockData.info.name, symbol)}>
                        Add to Portfolio
                    </button>
                </div>
                <DashboardItem 
                    key={symbol}
                    name={stockData?.info?.name ?? 'Unknown'}
                    symbol={stockData?.info?.symbol ?? ''}
                    price={stockData?.info?.price ?? 0}
                    change={stockData?.info?.change ?? 0}
                    percentChange={stockData?.info?.percentChange ?? 0}
                    onClick={() => {}} 
                />
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
            </div>
        </>
    );
};

export default StockInfo;
