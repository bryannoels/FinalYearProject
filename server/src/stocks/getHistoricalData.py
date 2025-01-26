import yfinance as yf
import sys
import json

def get_historical_data(stock_symbol, range_param):
    stock = yf.Ticker(stock_symbol)
    
    interval_mapping = {
        '1d': '5m',
        '5d': '60m',
        '1mo': '90m',
        '3mo': '1d',
        '6mo': '5d',
        'ytd': '5d',
        '1y': '5d',
        '5y': '1mo',
        '10y': '1mo',
        'max': '3mo'
    }
    
    interval = interval_mapping.get(range_param, '1d')
    
    stock_info = stock.history(period=range_param, interval=interval)
    json_data = []
    for index, row in stock_info.iterrows():
        json_data.append({
            "date": index.strftime("%Y-%m-%d"),
            "time": index.strftime("%H:%M:%S"),
            "price": row["Close"]
        })
    stock_data = {}
    stock_data['symbol'] = stock_symbol
    stock_data['range'] = range_param
    stock_data['interval'] = interval
    stock_data['data'] = json_data
    
    return stock_data

# for lambda func: LABA-python-stocks-get-hist-data
def lambda_handler(event, context):
    stock_symbol = event.get("stock_symbol")
    range_param = event.get("range_param") if event.get("range_param") else '1d'

    stock_data = get_historical_data(stock_symbol, range_param)
    return json.dumps(stock_data)

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    range_param = sys.argv[2] if len(sys.argv) > 2 else '1d'

    stock_data = get_historical_data(stock_symbol, range_param)
    print(json.dumps(stock_data))
