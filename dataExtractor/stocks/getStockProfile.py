import yfinance as yf
import sys
import json
import math
from datetime import datetime
import pytz

def get_stock_profile(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    stock_data = {}
    stock_info = stock.info
    
    stock_data['companyName'] = stock_info.get('longName', None)
    stock_data['sector'] = stock_info.get('sector', None)
    stock_data['industry'] = stock_info.get('industry', None)
    stock_data['country'] = stock_info.get('country', None)
    stock_data['state'] = stock_info.get('state', None)
    stock_data['city'] = stock_info.get('city', None)
    stock_data['address'] = stock_info.get('address1', None)
    stock_data['phone'] = stock_info.get('phone', None)
    stock_data['website'] = stock_info.get('website', None)
    stock_data['CEO'] = next((officer['name'] for officer in stock_info.get('companyOfficers', None) if any(leader in officer.get('title', '') for leader in ["CEO", "President Director", "GM"])), None)
    stock_data['fullTimeEmployees'] = stock_info.get('fullTimeEmployees', None)
    stock_data['longBusinessSummary'] = stock_info.get('longBusinessSummary', None)
    
    edt_timezone = pytz.timezone('America/New_York')
    current_time_edt = datetime.now(edt_timezone).strftime('%A, %d %B %Y at %H:%M %Z')
    stock_data['retrievedAt'] = current_time_edt

    return stock_data

def lambda_handler(event, context):
    stock_symbol = event.get('stock_symbol')
    stock_data = get_stock_profile(stock_symbol)
    return stock_data

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_stock_profile(stock_symbol)
    print(json.dumps(stock_data, indent=4))
