import sys
import requests
from bs4 import BeautifulSoup
import json

def get_stock_data(stock_symbol):
    url = f'https://finance.yahoo.com/quote/{stock_symbol}'
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        stock_data = {}

        company_name_tag = soup.find('h1', class_='yf-xxbei9')
        if company_name_tag:
            company_name = company_name_tag.text.split(' (')[0]
            stock_data['Company Name'] = company_name
        else:
            stock_data['Company Name'] = "Not found"

        fields = {
            'Current Price': 'regularMarketPrice',
            'Opening Price': 'regularMarketOpen',
            'Previous Close': 'regularMarketPreviousClose',
            'Day\'s Range': 'regularMarketDayRange',
            '52-Week Range': 'fiftyTwoWeekRange',
            'Volume': 'regularMarketVolume',
            'Market Cap': 'marketCap'
        }

        for field, data_field in fields.items():
            price_tag = soup.find('fin-streamer', {'data-field': data_field})
            if price_tag:
                stock_data[field] = price_tag.text
            else:
                stock_data[field] = "Not found"
        
        return stock_data
    else:
        return {"error": "Failed to retrieve data."}

def lambda_handler(event, context): # Event and context required by AWS Lambda function
    stock_symbol = event.get("stock_symbol", "AAPL")  # Default to "AAPL" if not provided
    stock_data = get_stock_data(stock_symbol)
    return json.dumps(stock_data)

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_stock_data(stock_symbol)
    print(json.dumps(stock_data))
