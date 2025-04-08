import yfinance as yf
import sys
import json
from getAaaCorporateBondYield import get_aaa_corporate_bond_yield

def get_benjamin_graham_value(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    eps = stock.info.get("trailingEps", None)
    growth = stock.growth_estimates.get("stockTrend", {}).get("+1y", 0)*100
    current_yield = float(get_aaa_corporate_bond_yield()['aaaCorporateBondYield'][:-1])
    intrinsic_value = round(eps * (8.5 + 2 * growth) * 4.4 / current_yield, 2)

    return {
        "Symbol": stock_symbol,
        "EPS": eps,
        "GrowthRate": growth,
        "CurrentYield": current_yield,
        "BenjaminGrahamIntrinsicValue": intrinsic_value,
    }

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_benjamin_graham_value(stock_symbol)
    print(json.dumps(stock_data, indent=2))
