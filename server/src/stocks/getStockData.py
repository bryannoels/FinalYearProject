import yfinance as yf
import sys
import json

def get_stock_data(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    stock_data = {}
    stock_info = stock.info
    growth_rate = stock.growth_estimates
    
    stock_data['companyName'] = stock_info.get('longName', "Not found")
    stock_data['currentPrice'] = stock_info.get('currentPrice', "Not found")
    stock_data['openingPrice'] = stock_info.get('regularMarketOpen', "Not found")
    stock_data['previousClose'] = stock_info.get('regularMarketPreviousClose', "Not found")
    stock_data['volume'] = stock_info.get('regularMarketVolume', "Not found")
    stock_data['marketCap'] = stock_info.get('marketCap', "Not found")
    stock_data['totalRevenue'] = stock_info.get('totalRevenue', "Not found")
    stock_data['currentRatio'] = stock_info.get('currentRatio', "Not found")
    stock_data['peRatio'] = stock_info.get('trailingPE', "Not found")
    stock_data['priceToBook'] = stock_info.get('priceToBook', "Not found")
    stock_data['earningsGrowth'] = stock_info.get('earningsGrowth', "Not found")
    stock_data['revenuePerShare'] = stock_info.get('revenuePerShare', "Not found")
    stock_data['ebitda'] = stock_info.get('ebitda', "Not found")
    stock_data['growthRate'] = growth_rate.get('stock', "Not found").get('+1y', "Not found")
    stock_data['dividends'] = [{"Year": int(year), "Dividend": dividend} for year, dividend in stock.dividends.groupby(stock.dividends.index.year).max().items()]

    return stock_data

def lambda_handler(event, context):
    stock_symbol = event['pathParameters'].get('stock_symbol')
    stock_data = get_stock_data(stock_symbol)
    return json.dumps(stock_data)

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_stock_data(stock_symbol)
    print(json.dumps(stock_data))