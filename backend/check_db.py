import sqlite3
import os

try:
    conn = sqlite3.connect('backend/db.sqlite3')
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='socialaccount_socialapp_sites';")
    result = cursor.fetchone()
    if result:
        print("TABLE_EXISTS")
    else:
        print("TABLE_MISSING")
    conn.close()
except Exception as e:
    print(f"ERROR: {e}")
