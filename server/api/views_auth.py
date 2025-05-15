# server/api/views_auth.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from .serializers import UserSerializer, RegisterSerializer
import logging

# Set up logger
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Authenticate user and return Token for successful login.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    logger.info(f"Login attempt for user: {username}")
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Authenticate user
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Check if user is staff for admin access
        if not user.is_staff:
            logger.warning(f"User {username} is not staff, access denied")
            return Response(
                {'error': 'Access denied. Admin privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Get or create token
        token, created = Token.objects.get_or_create(user=user)
        
        # Serialize user data
        user_serializer = UserSerializer(user, context={'request': request})
        
        # Return user data and token
        return Response({
            'token': token.key,
            'user': user_serializer.data
        })
    else:
        # Improved error handling
        user_exists = authenticate(username=username)  # Will be None if user doesn't exist
        
        if user_exists:
            logger.warning(f"User {username} exists but password is incorrect")
        else:
            logger.warning(f"User {username} does not exist")
        
        return Response(
            {'error': 'Invalid credentials'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
        
        
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user without requiring authentication
    """
    logger.info("Registration attempt")
    
    serializer = RegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        # Create user
        user = serializer.save()
        
        # Create token for the new user
        token, _ = Token.objects.get_or_create(user=user)
        
        # Serialize user data
        user_serializer = UserSerializer(user, context={'request': request})
        
        # Return user info and token
        response_data = {
            'token': token.key,
            'user': user_serializer.data
        }
        
        logger.info(f"New user registered: {user.username}")
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    logger.warning(f"Registration failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)