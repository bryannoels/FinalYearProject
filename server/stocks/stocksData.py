import requests
from bs4 import BeautifulSoup

def get_stock_data(stock_symbol):
    url = f'https://finance.yahoo.com/quote/{stock_symbol}'
    
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        
        stock_data = {}

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
        return "Failed to retrieve data."

if __name__ == "__main__":
    stock_symbols = ['AAPL', 'AMZN', 'TSLA', 'META', 'MSFT', 'GOOGL', 'NVDA', 'AMD']
    for stock_symbol in stock_symbols:
        stock_data = get_stock_data(stock_symbol)
        print(f"Data for {stock_symbol}:")
        for field, value in stock_data.items():
            print(f"{field}: {value}")
        print("\n")
