import yfinance as yf
import sys
import json

def search_stock(query):
    search_results = yf.Search(query)  
    quotes = search_results.quotes      

    stock_data = []
    for quote in quotes:
        ticker = quote.get("symbol", "N/A")
        name = quote.get("shortname", "N/A")
        
        if ticker.isalpha() and name != "N/A":
            stock_info = {
                "ticker": ticker,
                "name": name,
            }
            stock_data.append(stock_info)

        if len(stock_data) >= 5:
            break

    return stock_data

if __name__ == "__main__":
    query = sys.argv[1]
    stock_data = search_stock(query)
    print(json.dumps(stock_data, indent=2))
