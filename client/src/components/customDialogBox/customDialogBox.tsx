import React, { JSX } from 'react';
import './CustomDialogBox.css';

interface CustomDialogBoxProps {
    isOpen: boolean;
    dialogType: "add" | "removeStock" | "removePortfolio";
    stockName?: string;
    stockSymbol?: string;
    portfolioNames?: string[];
    selectedPortfolio?: string;
    onPortfolioChange?: (portfolioName: string) => void;
    onConfirm: () => void;
    onCancel: () => void;
}

const CustomDialogBoxProps: React.FC<CustomDialogBoxProps> = ({
    isOpen,
    dialogType: actionType,
    stockName,
    stockSymbol,
    portfolioNames = [],
    selectedPortfolio,
    onPortfolioChange,
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    let dialogMessage: JSX.Element = <></>;
    if (actionType === "add") {
        dialogMessage = (
            <>
                Add <strong>{stockName}</strong> (<strong>{stockSymbol}</strong>) to portfolio?
            </>
        )
    } else if (actionType === "removePortfolio") {
        dialogMessage = (
            <>
                Remove <strong>{selectedPortfolio}</strong> and all stocks in it?
            </>
        )
    } else if (actionType === "removeStock") {
        dialogMessage = (
            <>
                Remove <strong>{stockName}</strong> (<strong>{stockSymbol}</strong>) from <strong>{selectedPortfolio}</strong>?
            </>
        )
    }

    return (
        <div className="custom-dialog-box__overlay">
            <div className="custom-dialog-box__container">
                <div className="custom-dialog-box__message">
                    { dialogMessage }
                </div>
                {actionType === "add" && (
                    <div className="custom-dialog-box__portfolio">
                        <select
                            value={selectedPortfolio}
                            onChange={(e) => onPortfolioChange?.(e.target.value)}
                        >
                            <option value="">Select your portfolio</option>
                            {portfolioNames.map((portfolioName) => (
                                <option key={portfolioName} value={portfolioName}>
                                    {portfolioName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="custom-dialog-box__buttons-container">
                    <button className="custom-dialog-box__button" onClick={onConfirm}>{actionType === "add" ? "Add" : "Remove"}</button>
                    <button className="custom-dialog-box__button" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    )
}

export default CustomDialogBoxProps;
