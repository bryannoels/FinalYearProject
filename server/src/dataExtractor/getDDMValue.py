import yfinance as yf
import sys
import json
from getCostOfEquity import get_cost_of_equity

def get_ddm_value(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    
    dividend = stock.info.get("dividendRate", 0)
    growth_rate = round((lambda d: (d.iloc[-1] / d.iloc[0]) ** (1 / (len(d) - 1)) - 1 if len(d) > 1 else 0)(stock.dividends.groupby(stock.dividends.index.year).max()),6)
    
    beta = stock.info.get("beta", 0)
    cost_of_equity = round(get_cost_of_equity(beta),6)
    
    intrinsic_value = round(dividend * (1 + growth_rate) / (cost_of_equity - growth_rate), 2)
    
    return {
        "Symbol": stock_symbol,
        "Dividend": dividend,
        "GrowthRate": growth_rate,
        "Beta": beta,
        "CostOfEquity": cost_of_equity,
        "DDMIntrinsicValue": intrinsic_value,
    }

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_ddm_value(stock_symbol)
    print(json.dumps(stock_data, indent=2))
