import sqlite3
import os

db_path = os.path.join('backend', 'db.sqlite3')
print(f"Connecting to {db_path}")
conn = sqlite3.connect(db_path)
c = conn.cursor()
try:
    c.execute('CREATE TABLE IF NOT EXISTS "django_site" ("id" integer NOT NULL PRIMARY KEY AUTOINCREMENT, "domain" varchar(100) NOT NULL, "name" varchar(50) NOT NULL);')
    conn.commit()
    print("Created django_site table successfully")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
