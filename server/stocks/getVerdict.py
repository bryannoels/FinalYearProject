import sys
import json
from getAnalysis import get_analysis

def get_verdict(stock_symbol):
    analysis_data = get_analysis(stock_symbol)
    
    if isinstance(analysis_data, dict) and "error" in analysis_data:
        return analysis_data

    positive_count = 0
    neutral_count = 0
    negative_count = 0

    for item in analysis_data:
        action = item['Action']
        if action == 1:
            positive_count += 1
        elif action == 0:
            neutral_count += 1
        elif action == -1:
            negative_count += 1

    total_score = positive_count - negative_count

    if total_score > 0:
        verdict = "Buy"
    elif total_score == 0:
        verdict = "Hold"
    else:
        verdict = "Sell"

    return {
        "Symbol": stock_symbol,
        "Verdict": verdict,
        "Counts": {
            "Positive": positive_count,
            "Neutral": neutral_count,
            "Negative": negative_count
        }
    }

if __name__ == "__main__":
    stock_symbol = sys.argv[1]
    verdict_data = get_verdict(stock_symbol)
    print(json.dumps(verdict_data, indent=4))
