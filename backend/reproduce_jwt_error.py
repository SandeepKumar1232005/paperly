import os
import django
import requests
import sys

# Setup Django environment
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'paperly_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def test_jwt():
    # 1. Get or Create User
    email = "testVal@example.com"
    password = "password123"
    try:
        user = User.objects.get(email=email)
        print(f"Found user: {user.email}")
    except User.DoesNotExist:
        user = User.objects.create_user(username=email, email=email, password=password)
        print(f"Created user: {user.email}")

    # 2. Generate Token
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    print(f"Generated Access Token: {access_token[:20]}...")

    
    # 3. Test Protected Endpoint with Valid Token
    print(f"\n[Test 1] Valid Token for Active User")
    test_request(access_token)

    # 4. Test Inactive User
    print(f"\n[Test 2] Inactive User")
    user.is_active = False
    user.save()
    refresh_inactive = RefreshToken.for_user(user)
    token_inactive = str(refresh_inactive.access_token)
    test_request(token_inactive)
    
    user.is_active = True
    user.save()

    # 5. Test Invalid Signature (Tampered Token)
    print(f"\n[Test 3] Tampered Token")
    tampered_token = access_token[:-4] + "xxxx"
    test_request(tampered_token)

def test_request(token):
    url = "http://localhost:8000/api/auth/user/"
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print("Response Body:", response.text)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_jwt()
