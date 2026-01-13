import sqlite3
import os
import datetime

db_path = os.path.join('backend', 'db.sqlite3')
print(f"Connecting to {db_path}")
conn = sqlite3.connect(db_path)
c = conn.cursor()
try:
    # Check if sites.0001_initial is already applied
    c.execute("SELECT id FROM django_migrations WHERE app='sites' AND name='0001_initial'")
    if c.fetchone():
        print("sites.0001_initial already applied")
    else:
        print("Applying sites.0001_initial manually...")
        now = datetime.datetime.now()
        c.execute("INSERT INTO django_migrations (app, name, applied) VALUES (?, ?, ?)", ('sites', '0001_initial', now))
        conn.commit()
        print("Successfully inserted sites.0001_initial")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
