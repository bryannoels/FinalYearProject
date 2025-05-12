import yfinance as yf
import requests
import sys
import json
import math

def get_stock_data(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    print(stock.info)
    stock_data = {}
    stock_info = stock.info
    growth_rate = None
    try:
        growth_rate = stock.growth_estimates
        if growth_rate is not None and not growth_rate.empty:
            one_year_growth = growth_rate.loc["+1y"]["Growth"]
            stock_data['growthRate'] = one_year_growth
        else:
            stock_data['growthRate'] = None
    except requests.exceptions.HTTPError as e:
        print(f"No growth estimates found for {stock_symbol}: {e}")
        stock_data['growthRate'] = None
    except Exception as e:
        print(f"Error fetching growth estimates for {stock_symbol}: {e}")
        stock_data['growthRate'] = None

    stock_data['companyName'] = stock_info.get('longName', None)
    stock_data['currentPrice'] = stock_info.get('currentPrice', None)
    stock_data['openingPrice'] = stock_info.get('regularMarketOpen', None)
    stock_data['previousClose'] = stock_info.get('regularMarketPreviousClose', None)
    stock_data['volume'] = stock_info.get('regularMarketVolume', None)
    stock_data['marketCap'] = stock_info.get('marketCap', None)
    stock_data['totalRevenue'] = stock_info.get('totalRevenue', None)
    stock_data['currentRatio'] = stock_info.get('currentRatio', None)
    stock_data['peRatio'] = stock_info.get('trailingPE', None)
    stock_data['priceToBook'] = stock_info.get('priceToBook', None)
    stock_data['earningsGrowth'] = stock_info.get('earningsGrowth', None)
    stock_data['revenuePerShare'] = stock_info.get('revenuePerShare', None)
    stock_data['ebitda'] = stock_info.get('ebitda', None)
    stock_data['eps'] = stock_info.get('trailingEps', None)
    stock_data['totalDebt'] = stock_info.get('totalDebt', None)
    stock_data['debtToEquity'] = stock_info.get('debtToEquity', None)

    if isinstance(stock_data['growthRate'], float) and math.isnan(stock_data['growthRate']):
        stock_data['growthRate'] = None

    dividends = stock.dividends
    dividend_by_year = dividends.groupby(dividends.index.year).max()
    stock_data['dividends'] = [{"Year": int(year), "Dividend": dividend} for year, dividend in dividend_by_year.items()]

    return stock_data

def lambda_handler(event, context):
    stock_symbol = event['pathParameters'].get('stock_symbol')
    stock_data = get_stock_data(stock_symbol)
    return json.dumps(stock_data)

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_stock_data(stock_symbol)
    print(json.dumps(stock_data))