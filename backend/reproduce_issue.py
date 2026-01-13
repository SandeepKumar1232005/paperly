import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api/auth/registration/"
unique_id = int(time.time())
EMAIL = f"test_dupe_{unique_id}@example.com"
PASSWORD = "StrongPassword123!"

def register(email, password):
    payload = {
        "email": email,
        "password": password,
        "password1": password,
        "password2": password
    } 
    
    try:
        response = requests.post(BASE_URL, json=payload)
        with open("last_response.txt", "w") as f:
            f.write(response.text)
        print(f"Status: {response.status_code}")
        return response.status_code
    except Exception as e:
        print(f"Error: {e}")
        return 0

print(f"Attempt 1: Registering {EMAIL}")
status1 = register(EMAIL, PASSWORD)

print(f"\nAttempt 2: Registering {EMAIL} (Again)")
status2 = register(EMAIL, PASSWORD)

if status1 == 201 and status2 == 201:
    print("\n[FAIL] Backend allowed duplicate registration!")
elif status1 == 201 and status2 == 400:
    print("\n[PASS] Backend correctly rejected duplicate.")
else:
    print(f"\n[WARN] Unexpected results (1:{status1}, 2:{status2}).")
