from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

mongo_uri = os.getenv("MONGO_URI")
client = MongoClient(mongo_uri)
db = client["stock_analysis"]
collection = db["company_valuations"]
print("Connected to MongoDB")

result = collection.delete_many({})
print(f"Deleted {result.deleted_count} documents from 'company_valuations' collection.")
