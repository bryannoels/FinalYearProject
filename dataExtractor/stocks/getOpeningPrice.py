import yfinance as yf
import sys
import json

def get_opening_price(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    return stock.info.get('regularMarketOpen', None)

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_opening_price(stock_symbol)
    print(json.dumps(stock_data, indent=4))
