import sys
import requests
from datetime import datetime, timezone
import pytz
import json

def get_historical_data(stock_symbol, range_param):
    interval_mapping = {
        '1d': '5m',
        '5d': '60m',
        '3mo': '1d',
        '6mo': '5d',
        'ytd': '5d',
        '1y': '5d',
        '5y': '1mo',
    }

    interval = interval_mapping.get(range_param, '1d')
    
    historical_url = f'https://query1.finance.yahoo.com/v8/finance/chart/{stock_symbol}'
    headers = {'User-Agent': 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36'}

    response = requests.get(historical_url, headers=headers)
    if response.status_code == 200:
        data = response.json()
        prices = []
        if 'chart' in data and 'result' in data['chart'] and len(data['chart']['result']) > 0:
            timestamps = data['chart']['result'][0]['timestamp']
            indicators = data['chart']['result'][0]['indicators']['quote'][0]

            eastern = pytz.timezone('America/New_York')
            date = datetime.fromtimestamp(timestamps[0], tz=timezone.utc)

            for timestamp, close_price in zip(timestamps, indicators['close']):
                if close_price is not None:
                    utc_time = datetime.fromtimestamp(timestamp, tz=timezone.utc)
                    edt_time = utc_time.astimezone(eastern)

                    date_str = edt_time.strftime('%Y-%m-%d')

                    prices.append({
                        'date': date_str,
                        'time': edt_time.strftime('%H:%M:%S'),
                        'close': close_price
                    })
        if range_param == '1d':  
            return {
                'year': date.year,
                'month': date.strftime('%B'),
                'date': date.day,
                'prices': prices
            }
        else:
            return {
                'prices': prices
            }
    else:
        return {"error": "Failed to retrieve historical data."}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python getStocksData.py <stock_symbol> [<range_param>]")
        sys.exit(1)

    stock_symbol = sys.argv[1]
    range_param = sys.argv[2] if len(sys.argv) > 2 else '1d'

    stock_data = get_historical_data(stock_symbol, range_param)
    print(json.dumps(stock_data, indent=4))
