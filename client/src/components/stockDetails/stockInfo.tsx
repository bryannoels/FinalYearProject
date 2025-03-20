import React, { useState } from 'react';
import { Stock } from '../../types/Stock';
import { useNavigate } from 'react-router-dom';
import DashboardItem from '../../components/dashboardItem/DashboardItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import CustomDialogBox from '../../components/CustomDialogBox/CustomDialogBox';

interface StockInfoProps {
    portfolioName: string[];
    symbol: string,
    stockData: Stock | null;
}



const StockInfo: React.FC<StockInfoProps> = ({ symbol, stockData }) => {
    if (symbol == null || stockData == null) return null;
    const navigate = useNavigate();
    
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    const [isDialogOpen, setDialogOpen] = useState(false);
    const [dialogType, setDialogType] = useState<"add" | "removeStock" | "removePortfolio">("add");
    const [selectedStock, setSelectedStock] = useState<{ name: string; symbol: string } | null>(null);
    const [selectedPortfolio, setSelectedPortfolio] = useState<string>("");
    const [portfolios, setPortfolios] = useState<string[]>([]);
    const [screenLoading, setScreenLoading] = useState<boolean>(true);
    
    const openAddDialog = (stockName: string, symbol: string) => {
        
        if (authToken) {
            // TO-DO dialog box with message need to login
        }
        setSelectedStock({ name: stockName, symbol });
        setDialogType("add");
        setDialogOpen(true);
      };
    
    const showAddToPortfolioDialog = (stockName: string, symbol: string) => {
        //TO-DO, if not logged in, ask to login. If logged in, choose which portfolio. portfolio names alr stored somewhere
        console.log(`Adding ${stockName} (${symbol}) to portfolio`);
    }

    const handleConfirm = async () => {
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
            console.error('Error adding stock to portfolio:', error);
        } finally {
            setScreenLoading(false);
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
                    stockName={selectedStock?.name}
                    stockSymbol={selectedStock?.symbol}
                    portfolioNames={portfolios}
                    selectedPortfolio={selectedPortfolio}
                    onPortfolioChange={setSelectedPortfolio}
                    onConfirm={handleConfirm}
                    onCancel={() => setDialogOpen(false)}
                />
            </div>
        </>
    );
};

export default StockInfo;
