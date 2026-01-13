import requests
import json

BASE_URL = "http://localhost:8000/api/auth"

def debug_login(email, password):
    print(f"--- Attempting Login for {email} ---")
    
    # 1. Login
    login_payload = {
        "email": email,
        "password": password,
        "username": email # Just in case
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/login/", json=login_payload)
        print(f"Login Status: {resp.status_code}")
        
        if resp.status_code != 200:
            print("Login Failed:", resp.text)
            return

        data = resp.json()
        print("Login Response Keys:", data.keys())
        
        token = data.get('key') or data.get('access_token') or data.get('token')
        
        if not token:
            print("No token found in response!")
            return

        print(f"Token obtained: {token[:10]}...")

        # 2. Get User Details
        print("\n--- Fetching User Details ---")
        headers = {'Authorization': f'Token {token}'}
        user_resp = requests.get(f"{BASE_URL}/user/", headers=headers)
        
        print(f"User Details Status: {user_resp.status_code}")
        print("User Details Body:")
        print(json.dumps(user_resp.json(), indent=2))

    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    # Monitor the user 'user' which seems to be the one in the screenshot
    # Or try a known user
    debug_login("charlie@admin.com", "paperly123")
