import yfinance as yf
import sys
import json

def get_stock_data(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    stock_data = {}
    stock_info = stock.info
    
    stock_data['companyName'] = stock_info.get('longName', "Not found")
    stock_data['currentPrice'] = stock_info.get('currentPrice', "Not found")
    stock_data['openingPrice'] = stock_info.get('regularMarketOpen', "Not found")
    stock_data['previousClose'] = stock_info.get('regularMarketPreviousClose', "Not found")
    stock_data['volume'] = stock_info.get('regularMarketVolume', "Not found")
    stock_data['marketCap'] = stock_info.get('marketCap', "Not found")
    stock_data['totalRevenue'] = stock_info.get('totalRevenue', "Not found")
    stock_data['ebitda'] = stock_info.get('ebitda', "Not found")
    stock_data['priceToBook'] = stock_info.get('priceToBook', "Not found")
    stock_data['earningsGrowth'] = stock_info.get('earningsGrowth', "Not found")
    stock_data['revenuePerShare'] = stock_info.get('revenuePerShare', "Not found")
    

    return stock_data

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_stock_data(stock_symbol)
    print(json.dumps(stock_data))