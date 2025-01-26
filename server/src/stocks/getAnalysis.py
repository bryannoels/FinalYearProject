import yfinance as yf
import sys
import json

def get_recommendation(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    stock_data = {}
    stock_info = stock.upgrades_downgrades.head(10)
    
    stock_data = []
    
    for _index, row in stock_info.iterrows():
        analysis = row["ToGrade"].lower()
        rating = 0
        if any(keyword in analysis for keyword in ['outperform', 'buy', 'overweight', 'positive']):
            rating = 1
        elif any(keyword in analysis for keyword in ['sell', 'underweight', 'underperform', 'negative', 'reduce']):
            rating = -1
        else:
            rating =  0
        stock_data.append({
            "firm": row["Firm"],
            "analysis": row["ToGrade"],
            "rating": rating
        })

    return stock_data

# for lambda func: LABA-python-stock-get-analysis
def lambda_handler(event, context):
    stock_symbol = event.get("stock_symbol")
    
    if not stock_symbol:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Stock symbol is required"})
        }

    stock_data = get_recommendation(stock_symbol)
    return json.dumps(stock_data)

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    stock_data = get_recommendation(stock_symbol)
    print(json.dumps(stock_data))