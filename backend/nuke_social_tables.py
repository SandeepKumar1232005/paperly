import sqlite3
import os

db_path = os.path.join('backend', 'db.sqlite3')
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

tables_to_drop = [
    'socialaccount_socialapp_sites',
    'socialaccount_socialtoken',
    'socialaccount_socialaccount',
    'socialaccount_socialapp',
    'socialaccount_emailaddress', 
    'socialaccount_emailconfirmation'
]

# Note: emailaddress/confirmation might belong to `account` app, but socialaccount depends on it. 
# actually `account_emailaddress` is usually `account`. 
# checking installed apps: `allauth.socialaccount` -> `socialaccount_*`
# `allauth.account` -> `account_*`

tables_to_drop = [
    'socialaccount_socialapp_sites',
    'socialaccount_socialtoken',
    'socialaccount_socialaccount',
    'socialaccount_socialapp'
]

for table in tables_to_drop:
    print(f"Dropping {table}...")
    try:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

conn.commit()
conn.close()
