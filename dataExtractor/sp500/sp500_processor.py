import pandas as pd
import yfinance as yf
import time
import random
from getBenjaminGrahamList import get_benjamin_graham_list

total_start_time = time.time()
input_file = "sp500_companies.csv"
output_file = "data.csv"

df = pd.read_csv(input_file)
if "Symbol" not in df.columns:
    raise ValueError("CSV must contain a 'Symbol' column.")

results = []

counter = 1

for symbol in df["Symbol"].tolist():
    try:
        start_time = time.time()
        print(f"Processing {counter}: {symbol}...")
        result = get_benjamin_graham_list(symbol)
        results.append(result)
        print(f"Result: {result}")
    except Exception as e:
        print(f"Error processing {symbol}: {e}")
    
    end_time = time.time()
    time_spent = end_time - start_time
    print(f"Time spent processing {symbol}: {time_spent:.2f} seconds\n")
    
    sleep_time = random.uniform(15, 20)
    print (f"Sleeping for {sleep_time:.2f} seconds...")
    time.sleep(sleep_time)
    
    counter += 1
    

output_df = pd.DataFrame(results)
output_df.to_csv(output_file, index=False)

print(f"Processing complete. Data saved to {output_file}.")
total_end_time = time.time()
total_time_spent = total_end_time - total_start_time
print(f"Total time spent: {total_time_spent:.2f} seconds")
