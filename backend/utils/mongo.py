import pymongo
import os
from django.conf import settings

MONGO_URI = os.environ.get('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB_NAME = os.environ.get('MONGO_DB_NAME', 'paperly_db')

try:
    client = pymongo.MongoClient(MONGO_URI)
    db = client[MONGO_DB_NAME]
    print(f"Connected to MongoDB: {db.name}")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    db = None
