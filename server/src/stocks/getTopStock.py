import requests
from bs4 import BeautifulSoup
import json
import re
import random
import sys

USER_AGENTS = [
   "Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
   "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Safari/605.1.15",
   "Mozilla/5.0 (X11; Linux aarch64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 CrKey/1.54.250320",
   "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36",
   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36"
]

def get_top_stocks(category="most-active"):
   category_urls = {
       "most-active": "https://finance.yahoo.com/markets/stocks/most-active/",
       "trending": "https://finance.yahoo.com/trending-tickers/",
       "gainers": "https://finance.yahoo.com/markets/stocks/gainers/",
       "losers": "https://finance.yahoo.com/markets/stocks/losers/",
       "52-week-gainers": "https://finance.yahoo.com/markets/stocks/52-week-gainers/",
       "52-week-losers": "https://finance.yahoo.com/markets/stocks/52-week-losers/"
   }
   
   if category not in category_urls:
       return {"error": f"Invalid category: {category}. Valid categories are: {', '.join(category_urls.keys())}"}
   
   url = category_urls[category]
   headers = {
       "User-Agent": random.choice(USER_AGENTS)
   }
   
   response = requests.get(url, headers=headers)
   if response.status_code == 200:
       soup = BeautifulSoup(response.text, 'html.parser')
       stocks_data = []

       table = soup.find('table', {'class': 'markets-table'})
       if (table):
           rows = table.find_all('tr')
           for row in rows[1:11]:
               stock = {}
               symbol_tag = row.find('span', attrs={'class': 'symbol'})
               stock['Symbol'] = symbol_tag.text.strip() if symbol_tag else 'N/A'
               
               name_tag = row.find_all('td')[1].find('div')
               stock['Company Name'] = name_tag.text if name_tag else 'N/A'
               
               price_tag = row.find('fin-streamer', attrs={'data-field': 'regularMarketPrice'})
               stock['Price'] = price_tag.text if price_tag else 'N/A'
               
               change_tag = row.find('fin-streamer', attrs={'data-field': 'regularMarketChange'})
               stock['Change'] = change_tag.text if change_tag else 'N/A'
               
               change_percent_tag = row.find('fin-streamer', attrs={'data-field': 'regularMarketChangePercent'})
               stock['Change%'] = re.sub(r'^\(|\)$', '', change_percent_tag.text) if change_percent_tag else 'N/A'
               
               stocks_data.append(stock)
       return stocks_data[:10]
   else:
       return {"error": f"Failed to retrieve data. Status code: {response.status_code}"}

def lambda_handler(event, context):
   category = event.get('queryStringParameters', {}).get('category', 'most-active')
   stocks = get_top_stocks(category)
   
   return {
       'statusCode': 200,
       'headers': {
           'Content-Type': 'application/json',
           'Access-Control-Allow-Origin': '*'
       },
       'body': json.dumps(stocks, indent=2)
   }

if __name__ == "__main__":
   category = sys.argv[1]
   top_stocks = get_top_stocks(category)
   print(json.dumps(top_stocks, indent=2))