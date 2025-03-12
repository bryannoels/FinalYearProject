import yfinance as yf
import sys
import json

def get_dcf_value(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    
    free_cashflow_list = stock.cashflow.loc["Free Cash Flow"].dropna()

    try:
        free_cashflow = free_cashflow_list.iloc[0]
    except:
        print("Error fetching Free Cash Flow")
        free_cashflow = 0

    growth_rate = ((free_cashflow_list.iloc[0] / free_cashflow_list.iloc[-1]) ** (1 / len(free_cashflow_list)) - 1).real
    market_cap = stock.info.get("marketCap", None)
    total_debt = stock.info.get("totalDebt", None)
    total_cash = stock.info.get("totalCash", None)
    
    if not total_cash:
        total_cash = 0
    if not total_debt:
        total_debt = 0

    total_value = market_cap + total_debt

    risk_free_rate = 0.045
    beta = stock.info.get("beta", None)
    expected_market_return = 0.10

    if beta:
        cost_of_equity = risk_free_rate + beta * (expected_market_return - risk_free_rate)
    else:
        cost_of_equity = 0.08

    try:
        interest_expense = stock.financials.loc["Interest Expense"].dropna().iloc[0]
        cost_of_debt = (interest_expense / total_debt) * (1 - 0.21) if total_debt else 0.03
    except:
        print("Error fetching Interest Expense")
        cost_of_debt = 0.03

    if total_value > 0:
        wacc = (market_cap / total_value) * cost_of_equity + (total_debt / total_value) * cost_of_debt
    else:
        wacc = 0.08

    if growth_rate >= wacc:
        growth_rate = wacc - 0.01

    total_pv = 0
    for year in range(1, 6):
        total_pv += free_cashflow * (1 + growth_rate) ** year / (1 + wacc) ** year

    terminal_value = free_cashflow * (1 + growth_rate) ** 6 / (wacc - growth_rate)
    discounted_terminal_value = terminal_value / (1 + wacc) ** 5
    enterprise_value = total_pv + discounted_terminal_value
    net_debt = total_debt - total_cash

    shares_outstanding = stock.info.get("sharesOutstanding", None)
    if not shares_outstanding:
        shares_outstanding = stock.info.get("floatShares", None)

    if shares_outstanding:
        intrinsic_value = round((enterprise_value - net_debt) / shares_outstanding,2)
    else:
        intrinsic_value = None

    current_price = stock.info.get("currentPrice", None)

    
    print(f"Growth Rate: {round(growth_rate*100, 2)} %")
    print(f"Intrinsic Value per Share: {intrinsic_value}")
    print(f"Current Stock Price: {current_price}")
    
    if (intrinsic_value and current_price):
        if intrinsic_value > current_price:
            print("Recommendation: Buy")
            print("Undervalued by ", round((intrinsic_value - current_price) / intrinsic_value * 100, 2), "%")
        else:
            print("Recommendation: Sell")
            print("Overvalued by ", round((current_price - intrinsic_value) / intrinsic_value * 100, 2), "%")

    return intrinsic_value

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_dcf_value(stock_symbol)
    print(json.dumps(stock_data, indent=2))
