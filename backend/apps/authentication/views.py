from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import jwt
import datetime
from passlib.hash import pbkdf2_sha256
import uuid
from utils.mongo import db

# Helper to get DB
# db imported above

class RegisterView(APIView):
    authentication_classes = [] # Disable CSRF check implied by SessionAuth
    permission_classes = []

    def post(self, request):
        data = request.data
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        username = data.get('username') # New field
        role = data.get('role', 'STUDENT')

        if not email or not password or not username:
            return Response({'error': 'Email, password, and username required'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if user exists (email OR username)
        if db.users.find_one({'$or': [{'email': email}, {'username': username}]}):
            existing_user = db.users.find_one({'$or': [{'email': email}, {'username': username}]})
            if existing_user.get('username') == username:
                 return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        # Hash password
        hashed_password = pbkdf2_sha256.hash(password)

        user_id = str(uuid.uuid4())
        new_user = {
            'id': user_id,
            'email': email,
            'username': username, # Store username
            'password': hashed_password, # Store hash!
            'name': name,
            'role': role,
            'created_at': datetime.datetime.utcnow()
        }

        db.users.insert_one(new_user)
        
        # Determine redirect/payload
        return Response({'message': 'User created successfully', 'user': {'email': email, 'username': username, 'role': role, 'id': user_id}}, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    authentication_classes = [] # Disable CSRF check
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = db.users.find_one({'email': email})
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        if not pbkdf2_sha256.verify(password, user['password']):
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate Token (Simple JWT or custom)
        # Using pyjwt for simplicity
        token_payload = {
            'user_id': user['id'],
            'email': user['email'],
            'role': user.get('role', 'STUDENT'),
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
        }
        token = jwt.encode(token_payload, settings.SECRET_KEY, algorithm='HS256')

        return Response({
            'key': token, # Frontend expects 'key' or 'access' depending on previous dj-rest-auth? dj-rest-auth uses 'key' or 'access_token'
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user.get('name'),
                'role': user.get('role')
            }
        })
