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
        try:
            data = request.data
            email = data.get('email')
            password = data.get('password')
            name = data.get('name')
            username = data.get('username') # New field
            role = data.get('role', 'STUDENT')

            print(f"Register attempt: {email}, {username}")

            if not email or not password or not username:
                return Response({'error': 'Email, password, and username required'}, status=status.HTTP_400_BAD_REQUEST)

            # Check if user exists (email OR username)
            if db is None:
                print("CRITICAL: MongoDB not connected")
                return Response({'error': 'Database error'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
            print("User inserted successfully")
            
            # Determine redirect/payload
            return Response({'message': 'User created successfully', 'user': {'email': email, 'username': username, 'role': role, 'id': user_id}}, status=status.HTTP_201_CREATED)
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class LoginView(APIView):
    authentication_classes = [] # Disable CSRF check
    permission_classes = []

    def post(self, request):
        identifier = request.data.get('email') # Frontend still sends 'email' state, but it can be username
        password = request.data.get('password')

        if not identifier or not password:
             return Response({'error': 'Please provide both username/email and password'}, status=status.HTTP_400_BAD_REQUEST)

        # Find by email OR username
        user = db.users.find_one({
            '$or': [
                {'email': identifier},
                {'username': identifier}
            ]
        })

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

class UserDetailsView(APIView):
    # Retrieve and Update user details
    # Expects Authorization: Bearer <token> (or Token ?)
    # My simple implementation in api.ts uses 'Bearer' or 'Token'.
    # I need a custom authentication class or manually decode token here because I disabled global auth classes?
    # Ideally I should use a permission class, but since I am using manual JWT encoding in LoginView...
    # I need to duplicate the verify logic or use a middleware/DRF auth.
    # For speed/simplicity in this "Do it yourself" backend, I'll verifying token in the view.
    
    authentication_classes = [] 
    permission_classes = []

    def get_user_from_token(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        try:
            # "Bearer <token>" or "Token <token>"
            token = auth_header.split(' ')[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            user_id = payload.get('user_id')
            user = db.users.find_one({'id': user_id})
            return user
        except Exception as e:
            print("Token Error:", e)
            return None

    def get(self, request):
        user = self.get_user_from_token(request)
        if not user:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)
        
        return Response({
            'id': user['id'],
            'username': user.get('username'),
            'email': user['email'],
            'first_name': user.get('name', '').split(' ')[0], # Adapter for frontend expecting first_name
            'last_name': ' '.join(user.get('name', '').split(' ')[1:]),
            'name': user.get('name'),
            'role': user.get('role'),
            'avatar': user.get('avatar'),
            'address': user.get('address'),
            'is_verified': user.get('is_verified', False)
        })

    def patch(self, request):
        user = self.get_user_from_token(request)
        if not user:
             return Response({'error': 'Unauthorized'}, status=status.HTTP_401_UNAUTHORIZED)

        updates = request.data
        valid_updates = {}
        
        # Whitelist fields
        if 'name' in updates: valid_updates['name'] = updates['name']
        if 'address' in updates: valid_updates['address'] = updates['address']
        if 'avatar' in updates: valid_updates['avatar'] = updates['avatar']
        
        if valid_updates:
            db.users.update_one({'id': user['id']}, {'$set': valid_updates})
            
        # Return updated user
        updated_user = db.users.find_one({'id': user['id']})
        
        return Response({
            'id': updated_user['id'],
            'username': updated_user.get('username'),
            'email': updated_user['email'],
             'name': updated_user.get('name'),
            'role': updated_user.get('role'),
            'avatar': updated_user.get('avatar'),
            'address': updated_user.get('address'),
            'is_verified': updated_user.get('is_verified', False)
        })
