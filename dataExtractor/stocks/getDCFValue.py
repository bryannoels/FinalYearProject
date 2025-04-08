import yfinance as yf
import sys
import json
from getCostOfEquity import get_cost_of_equity

def get_dcf_value(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    
    free_cashflow_list = stock.cashflow.loc["Free Cash Flow"].dropna()

    try:
        free_cashflow = free_cashflow_list.iloc[0]
    except:
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

    beta = stock.info.get("beta", 0)
    cost_of_equity = get_cost_of_equity(beta)

    try:
        interest_expense = stock.financials.loc["Interest Expense"].dropna().iloc[0]
        cost_of_debt = (interest_expense / total_debt) * (1 - 0.21) if total_debt else 0.03
    except:
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

    return {
        "Symbol": stock_symbol,
        "FreeCashFlow": free_cashflow,
        "GrowthRate": round(growth_rate*100, 2),
        "WACC": round(wacc*100, 2),
        "EnterpriseValue": enterprise_value,
        "NetDebt": net_debt,
        "DCFIntrinsicValue": intrinsic_value,
    }

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_dcf_value(stock_symbol)
    print(json.dumps(stock_data, indent=2))
