from django.shortcuts import render

# Create your views here.
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

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

@api_view(['POST'])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

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