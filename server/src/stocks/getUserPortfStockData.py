# Used by lambda func: LABA-python-users-get-portfolio-stock-data
import yfinance as yf
import sys
import json

def get_stock_data(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    stock_data = {}
    stock_info = stock.info

    stock_data['companyName'] = stock_info.get('longName', "Not found")
    stock_data['currentPrice'] = stock_info.get('currentPrice', "Not found")
    stock_data['change'] = f"{float(stock_data.get('currentPrice') - stock_info.get('previousClose')):.2f}"
    stock_data['change%'] = f"{((float(stock_data.get('currentPrice')) / stock_info.get('previousClose')) - 1.00) * 100:.2f}"

    return stock_data

def lambda_handler(event, context):
    items = event.get("Items", [])
    
    if not isinstance(items, list):
        return {
            "statusCode": 400,
            "body": json.dumps({
                "error": "Invalid input. Expected an array of portfolio objects in 'Items'."
            })
        }

    portfolios_stock_data = {}

    for item in items:
        portfolio_name = item.get("portfolioName", "N/A")
        stock_symbols  = item.get("stock", [])

        if not isinstance(stock_symbols, list):
            portfolios_stock_data[portfolio_name] = {
                "error": f"Invalid stock list for portfolio '{portfolio_name}'"
            }
            continue
        
        portfolio_stock_data = []

        for stock_symbol in stock_symbols:
            try:
                stock_data = get_stock_data(stock_symbol)
                portfolio_stock_data.append({
                    "Symbol": stock_symbol,
                    "Company Name": stock_data.get("companyName"),
                    "Price": stock_data.get("currentPrice"),
                    "Change": stock_data.get("change"),
                    "Change%": stock_data.get("change%")
                })
            except Exception as e:
                portfolio_stock_data.append({
                    "stockSymbol": stock_symbol,
                    "error": str(e)
                })

        portfolios_stock_data[portfolio_name] = portfolio_stock_data

    return {
        "statusCode": 200,
        "body": json.dumps(portfolios_stock_data)
    }

if __name__ == "__main__":
    stock_symbols = sys.argv[1:]
    all_stock_data = {}
    for stock_symbol in stock_symbols:
        all_stock_data[stock_symbol] = get_stock_data(stock_symbol)
    print(json.dumps(all_stock_data))
