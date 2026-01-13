import requests
import os

URL = "http://localhost:8000/api/auth/google/"

print(f"Testing POST to {URL}")

try:
    # Sending a dummy access token. 
    # Even with a bad token, it should return JSON (400 Bad Request), not HTML (500/404).
    response = requests.post(URL, json={"access_token": "dummy_token_to_force_error"})
    
    print(f"Status Code: {response.status_code}")
    print("Response Headers:", response.headers)
    
    if "application/json" in response.headers.get("Content-Type", ""):
        print("Response is JSON (Good):")
        print(response.json())
    else:
        print("Response is NOT JSON (Unknown/Error). Saving to last_error.html")
        with open("last_error.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        
except Exception as e:
    print(f"Request failed: {e}")
