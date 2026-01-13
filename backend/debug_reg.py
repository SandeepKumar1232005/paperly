import requests
import json
import random
import string

BASE_URL = "http://localhost:8000/api/auth"

def random_string(length=8):
    return ''.join(random.choices(string.ascii_lowercase, k=length))

def debug_registration():
    email = f"test_{random_string()}@example.com"
    password = "CorrectHorseBatteryStaple99!"
    username = email
    
    print(f"--- Attempting Registration for {email} ---")
    
    payload = {
        "email": email,
        "username": username,
        "password": password,
        "password1": password,
        "password2": password,
        "first_name": "Test",
        "last_name": "User"
    }

    try:
        # 1. Register
        resp = requests.post(f"{BASE_URL}/registration/", json=payload)
        print(f"Registration Status: {resp.status_code}")
        
        if resp.status_code >= 400:
            print("Registration Failed:", resp.text[:1000]) # Print first 1000 chars of HTML
            return

        data = resp.json()
        print("Registration Response:")
        print(json.dumps(data, indent=2))
        
        token = data.get('key') or data.get('access_token')

        if not token:
            print("No token in registration response, trying login...")
            # Try login
            l_resp = requests.post(f"{BASE_URL}/login/", json={"email": email, "password": password, "username": username})
            token = l_resp.json().get('key')
            print(f"Login Token: {token}")

        if token:
            # 2. Get User
            headers = {'Authorization': f'Token {token}'}
            user_resp = requests.get(f"{BASE_URL}/user/", headers=headers)
            print(f"\nUser Details Status: {user_resp.status_code}")
            print(json.dumps(user_resp.json(), indent=2))

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    debug_registration()
