import yfinance as yf
import sys
import json

def get_beta_value(stock_symbol):
    stock = yf.Ticker(stock_symbol)

    return stock.info.get('beta')

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_beta_value(stock_symbol)
    print(json.dumps(stock_data, indent=4))
