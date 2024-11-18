import requests
from bs4 import BeautifulSoup
import json
import re

def get_top_10_most_active_stocks():
    url = 'https://finance.yahoo.com/markets/stocks/most-active/'
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        stocks_data = []

        rows = soup.find_all('tr', attrs={'class': 'yf-paf8n5'})
        
        for row in rows[1:11]:
            stock = {}
            
            symbol_tag = row.find('span', attrs={'class': 'symbol'})
            stock['Symbol'] = symbol_tag.text.strip() if symbol_tag else 'N/A'
            
            name_tag = row.find('span', attrs={'class': 'longName'})
            stock['Company Name'] = name_tag.text if name_tag else 'N/A'
            
            price_tag = row.find('fin-streamer', attrs={'data-field': 'regularMarketPrice'})
            stock['Price'] = price_tag.text if price_tag else 'N/A'
            
            change_tag = row.find('fin-streamer', attrs={'data-field': 'regularMarketChange'})
            stock['Change'] = change_tag.text if change_tag else 'N/A'
            
            change_percent_tag = row.find('fin-streamer', attrs={'data-field': 'regularMarketChangePercent'})
            stock['Change%'] = re.sub(r'^\(|\)$', '',change_percent_tag.text) if change_percent_tag else 'N/A'
            
            stocks_data.append(stock)
        return stocks_data
    else:
        return {"error": "Failed to retrieve data."}

def lambda_handler(event, context): # Event and context required by AWS Lambda function
    top_10_stocks = get_top_10_most_active_stocks()
    return json.dumps(top_10_stocks, indent=2)

if __name__ == "__main__":
    top_10_stocks = get_top_10_most_active_stocks()
    print(json.dumps(top_10_stocks, indent=2))
