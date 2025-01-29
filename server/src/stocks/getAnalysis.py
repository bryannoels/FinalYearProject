import yfinance as yf
import sys
import json

def fetch_stock_data(stock_symbol):
    stock = yf.Ticker(stock_symbol)
    recommendations = stock.recommendations
    upgrades_downgrades = stock.upgrades_downgrades.head(10)
    return recommendations, upgrades_downgrades

def calculate_recommendation_counts(recommendations):
    first_row = recommendations.iloc[0]
    return {
        "buy": int(first_row.strongBuy) + int(first_row.buy),
        "hold": int(first_row.hold),
        "sell": int(first_row.strongSell) + int(first_row.sell),
    }

def determine_rating(analysis, counts, current_counts):
    rating = None

    if any(keyword in analysis for keyword in ['outperform', 'buy', 'overweight', 'positive']):
        if current_counts["buy"] < counts["buy"]:
            rating = 1
            current_counts["buy"] += 1
    elif any(keyword in analysis for keyword in ['sell', 'underweight', 'underperform', 'negative', 'reduce']):
        if current_counts["sell"] < counts["sell"]:
            rating = -1
            current_counts["sell"] += 1
    else:
        if current_counts["hold"] < counts["hold"]:
            rating = 0
            current_counts["hold"] += 1

    return rating

def process_stock_analysis(stock_symbol):
    recommendations, upgrades_downgrades = fetch_stock_data(stock_symbol)
    counts = calculate_recommendation_counts(recommendations)
    current_counts = {"buy": 0, "hold": 0, "sell": 0}

    analysis_data = []
    seen_firms = set()

    for _, row in upgrades_downgrades.iterrows():
        if row["Firm"] in seen_firms:
            continue

        seen_firms.add(row["Firm"])
        analysis = row["ToGrade"].lower()
        rating = determine_rating(analysis, counts, current_counts)

        if rating is not None:
            analysis_data.append({
                "firm": row["Firm"],
                "analysis": row["ToGrade"],
                "rating": rating
            })

    verdict = max(counts, key=counts.get)
    
    return {
        "verdict": verdict,
        "number_of_buy": counts["buy"],
        "number_of_hold": counts["hold"],
        "number_of_sell": counts["sell"],
        "ratings": analysis_data
    }

def lambda_handler(event, context):
    stock_symbol = event.get("stock_symbol")

    if not stock_symbol:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Stock symbol is required"})
        }

    stock_data = process_stock_analysis(stock_symbol)
    return {
        "statusCode": 200,
        "body": json.dumps(stock_data)
    }

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python script.py <stock_symbol>")
        sys.exit(1)

    stock_symbol = sys.argv[1]
    stock_data = process_stock_analysis(stock_symbol)
    print(json.dumps(stock_data, indent=4))