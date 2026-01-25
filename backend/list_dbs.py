import pymongo

try:
    client = pymongo.MongoClient("mongodb://localhost:27017", serverSelectionTimeoutMS=2000)
    dbs = client.list_database_names()
    print(f"Databases found: {dbs}")
except Exception as e:
    print(f"Error: {e}")
