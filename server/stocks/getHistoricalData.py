import sys
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timezone
import pytz
import json

def get_historical_data(stock_symbol):
    historical_url = f'https://query1.finance.yahoo.com/v8/finance/chart/{stock_symbol}?interval=5m&range=1d'
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
    
    response = requests.get(historical_url, headers=headers)
    
    if response.status_code == 200:
        data = response.json()
        prices = []
        
        if 'chart' in data and 'result' in data['chart'] and len(data['chart']['result']) > 0:
            timestamps = data['chart']['result'][0]['timestamp']
            indicators = data['chart']['result'][0]['indicators']['quote'][0]

            eastern = pytz.timezone('America/New_York')
            date = datetime.fromtimestamp(timestamps[0], tz=timezone.utc)
            year = date.year
            month = date.strftime('%B')
            day = date.day

            for timestamp, close_price in zip(timestamps, indicators['close']):
                if close_price is not None and timestamp % 300 == 0:
                    utc_time = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                    edt_time = utc_time.astimezone(eastern)

                    prices.append({
                        'time': edt_time.strftime('%H:%M:%S'),
                        'close': close_price
                    })
                    
        return {
            'year': year,
            'month': month,
            'date': day,
            'prices': prices
        }
    else:
        return {"error": "Failed to retrieve historical data."}

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_historical_data(stock_symbol)
    print(json.dumps(stock_data, indent=4))