import sys
import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import pytz

def get_stock_data(stock_symbol):
    url = f'https://finance.yahoo.com/quote/{stock_symbol}'
    response = requests.get(url)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        stock_data = {}

        company_name_tag = soup.find('h1', class_='yf-xxbei9')
        if company_name_tag:
            company_name = company_name_tag.text.split(' (')[0]
            stock_data['companyName'] = company_name
        else:
            stock_data['companyName'] = "Not found"

        fields = {
            'currentPrice': 'regularMarketPrice',
            'openingPrice': 'regularMarketOpen',
            'previousClose': 'regularMarketPreviousClose',
            'daysRange': 'regularMarketDayRange',
            'week52Range': 'fiftyTwoWeekRange',
            'volume': 'regularMarketVolume',
            'marketCap': 'marketCap'
        }

        for field, data_field in fields.items():
            price_tag = soup.find('fin-streamer', {'data-field': data_field})
            stock_data[field] = price_tag.text if price_tag else "Not found"
            
        pe_ratio_tags = soup.find_all('fin-streamer', {'data-field': 'trailingPE'})
        if len(pe_ratio_tags) > 0 and 'data-value' in pe_ratio_tags[0].attrs:
            stock_data['peRatio'] = pe_ratio_tags[0]['data-value']
        if len(pe_ratio_tags) > 1 and 'data-value' in pe_ratio_tags[1].attrs:
            stock_data['eps'] = pe_ratio_tags[1]['data-value']

        valuation_measures = get_valuation_measures(soup)
        stock_data.update(valuation_measures)
        
        return stock_data
    else:
        return {"error": "Failed to retrieve data."}

def get_valuation_measures(soup):
    valuation_data = {}
    valuation_items = soup.find('section', {'data-testid': 'valuation-measures'}).find_all('li')

    for item in valuation_items:
        items = item.find_all('p')
        if len(items) >= 2:
            field_name = items[0].text.strip()
            value = items[1].text.strip()
            if "Price/Sales" in field_name:
                valuation_data['pricePerSales'] = value
            elif "Price/Book" in field_name:
                valuation_data['pricePerBook'] = value
    return valuation_data

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_stock_data(stock_symbol)
    print(json.dumps(stock_data, indent=4))
