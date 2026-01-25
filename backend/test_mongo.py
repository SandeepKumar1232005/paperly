import pymongo
import sys

try:
    client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    client.server_info() # force connection
    print("SUCCESS: Connected to MongoDB")
except Exception as e:
    print(f"FAILURE: Could not connect to MongoDB. Error: {e}")
