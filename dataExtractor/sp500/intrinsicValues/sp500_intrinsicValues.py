import pandas as pd
from pymongo import MongoClient
from dotenv import load_dotenv
import time
import sys
import os
import statistics

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'stocks')))
print(sys.path)

from getDCFValue import get_dcf_value
from getDDMValue import get_ddm_value
from getBenjaminGrahamValue import get_benjamin_graham_value
from getBetaValue import get_beta_value
from getOpeningPrice import get_opening_price

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["stock_analysis"]
collection = db["company_valuations"]
print("Connected to MongoDB")

df = pd.read_csv("../data.csv")

start_time = time.time()

result = collection.delete_many({})
print(f"Deleted {result.deleted_count} documents from 'company_valuations' collection.")

for index, row in df.head(20).iterrows():
    company_name = row["Company Name"]
    stock_symbol = row["Stock Symbol"]
    print(f"Processing {index} - {stock_symbol} - {company_name}...")
    
    opening_price = round(float(get_opening_price(stock_symbol)), 2)
    beta = round(float(get_beta_value(stock_symbol)), 2)
    

    dcf = round(float(get_dcf_value(stock_symbol)["DCFIntrinsicValue"]), 2)
    percent_dcf = round(((dcf - opening_price) / dcf) * 100, 2) if dcf != 0 else None
    percent_abs_dcf = round((abs(dcf - opening_price) / opening_price) * 100, 2) if dcf != 0 else None

    ddm = round(float(get_ddm_value(stock_symbol)["DDMIntrinsicValue"]), 2)
    percent_ddm = round(((ddm - opening_price) / ddm) * 100, 2) if ddm != 0 else None
    percent_abs_ddm = round((abs(ddm - opening_price) / opening_price) * 100, 2) if ddm != 0 else None

    graham = round(float(get_benjamin_graham_value(stock_symbol)["BenjaminGrahamIntrinsicValue"]), 2)
    percent_graham = round(((graham - opening_price) / graham) * 100, 2) if graham != 0 else None
    percent_abs_graham = round((abs(graham - opening_price) / opening_price) * 100, 2) if graham != 0 else None

    average = round((dcf + ddm + graham) / 3,2)
    percent_average = round(((average - opening_price) / opening_price) * 100,2)
    percent_abs_average = round((abs(average - opening_price) / opening_price) * 100,2)
    
    std_dev = round(statistics.stdev([dcf, ddm, graham]),2)

    doc = {
        "Stock Symbol": stock_symbol,
        "Company Name": company_name,
        "Opening Price": opening_price,
        "Beta": beta,
        "DCF Value": dcf,
        "Percent DCF": percent_dcf,
        "Percent Abs DCF": percent_abs_dcf,
        "DDM Value": ddm,
        "Percent DDM": percent_ddm,
        "Percent Abs DDM": percent_abs_ddm,
        "Benjamin Graham Value": graham,
        "Percent Benjamin Graham": percent_graham,
        "Percent Abs Benjamin Graham": percent_abs_graham,
        "Average Value": average,
        "Percent Average": percent_average,
        "Percent Abs Average": percent_abs_average,
        "Intrinsic Value Standard Deviation": std_dev,
    }
    print(f"Document to insert: {doc}")
    collection.insert_one(doc)
    print(f"Inserted {stock_symbol} - {company_name}")
    
    elapsed_time = time.time() - start_time
    print(f"Time elapsed after processing row {index}: {elapsed_time:.2f} seconds")
    
    time.sleep(1)

end_time = time.time()
total_elapsed_time = end_time - start_time
print(f"Total processing time: {total_elapsed_time:.2f} seconds")
