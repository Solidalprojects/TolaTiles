# server/api/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import TileCategory, TileImage, Project, ProjectImage
from .serializers import (UserSerializer, TileCategorySerializer, 
                          TileImageSerializer, ProjectSerializer, 
                          ProjectImageSerializer)
import logging

# Set up logger
logger = logging.getLogger(__name__)

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

# server/api/views.py - login_view function updated

@api_view(['POST'])
def login_view(request):
    """Handle user login and return JWT tokens on success."""
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Debug info
    print(f"Login attempt for user: {username}")
    print(f"Request data received: {request.data}")
    print(f"Request headers: {request.headers}")
    
    if not username or not password:
        return Response(
            {'error': 'Username and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Successfully authenticated
        print(f"User {username} authenticated successfully")
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }
        print(f"Generated token response: {response_data}")
        
        return Response(response_data)
    else:
        # Authentication failed
        print(f"Authentication failed for user: {username}")
        
        # Check if user exists (helps with debugging)
        user_exists = User.objects.filter(username=username).exists()
        if user_exists:
            print(f"User {username} exists but password is incorrect")
            error_message = "Invalid password"
        else:
            print(f"User {username} does not exist")
            error_message = "User not found"
        
        return Response(
            {'error': 'Invalid credentials', 'detail': error_message}, 
            status=status.HTTP_401_UNAUTHORIZED
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

class TileCategoryViewSet(viewsets.ModelViewSet):
    queryset = TileCategory.objects.all()
    serializer_class = TileCategorySerializer
    permission_classes = [IsAdminOrReadOnly]

class TileImageViewSet(viewsets.ModelViewSet):
    queryset = TileImage.objects.all()
    serializer_class = TileImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = TileImage.objects.all()
        category = self.request.query_params.get('category')
        featured = self.request.query_params.get('featured')
        
        if category:
            queryset = queryset.filter(category__id=category)
        if featured == 'true':
            queryset = queryset.filter(featured=True)
            
        return queryset.order_by('-created_at')

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = Project.objects.all()
        featured = self.request.query_params.get('featured')
        
        if featured == 'true':
            queryset = queryset.filter(featured=True)
            
        return queryset.order_by('-completed_date')

class ProjectImageViewSet(viewsets.ModelViewSet):
    queryset = ProjectImage.objects.all()
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAdminOrReadOnly]