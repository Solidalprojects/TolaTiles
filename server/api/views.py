# server/api/views.py
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import TileCategory, TileImage, Project, ProjectImage, Contact, Subscriber
from .serializers import (
    UserSerializer, TileCategorySerializer, TileCategoryDetailSerializer,
    TileImageSerializer, ProjectSerializer, ProjectDetailSerializer,
    ProjectImageSerializer, ContactSerializer, SubscriberSerializer
)
import logging

# Set up logger
logger = logging.getLogger(__name__)

class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission to allow admin users to perform all operations,
    but only allow read operations for non-admin users.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
import logging

# Set up logger
logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Handle user authentication and return token on success.
    This is specifically for admin users to access the dashboard.
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    logger.info(f"Admin login attempt for user: {username}")
    
    if not username or not password:
        logger.warning("Login attempt with missing username or password")
        return Response(
            {'error': 'Username and password are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if user is not None:
        # Check if user is staff/admin
        if not user.is_staff:
            logger.warning(f"User {username} is not an admin user but attempted admin login")
            return Response(
                {'error': 'Access denied. Admin privileges required.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        response_data = {
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_staff': user.is_staff,
                'first_name': user.first_name,
                'last_name': user.last_name
            }
        }
        
        logger.info(f"Admin user {username} authenticated successfully")
        return Response(response_data)
    else:
        # Check if user exists (helps with debugging)
        from django.contrib.auth.models import User
        user_exists = User.objects.filter(username=username).exists()
        
        if user_exists:
            logger.warning(f"User {username} exists but password is incorrect")
            error_message = "Invalid credentials"
        else:
            logger.warning(f"User {username} does not exist")
            error_message = "Invalid credentials"
        
        return Response(
            {'error': error_message}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
@api_view(['POST'])
def register_view(request):
    """
    Register a new user and return JWT tokens.
    """
    serializer = UserSerializer(data=request.data)
    
    if serializer.is_valid():
        # Check if password is provided
        password = request.data.get('password')
        if not password:
            return Response(
                {'error': 'Password is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create user but don't save yet
        user = serializer.save()
        user.set_password(password)
        user.save()
        
        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        response_data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }
        
        logger.info(f"New user registered: {user.username}")
        return Response(response_data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_info(request):
    """
    Get information about the currently authenticated user.
    """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """
    Change password for authenticated user.
    """
    user = request.user
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {'error': 'Both old and new passwords are required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify old password
    if not user.check_password(old_password):
        return Response(
            {'error': 'Old password is incorrect'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Set new password
    user.set_password(new_password)
    user.save()
    
    # Generate new tokens
    refresh = RefreshToken.for_user(user)
    
    response_data = {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'message': 'Password changed successfully'
    }
    
    return Response(response_data)

class TileCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Tile Categories.
    """
    queryset = TileCategory.objects.all()
    serializer_class = TileCategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'order', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TileCategoryDetailSerializer
        return TileCategorySerializer
    
    def get_queryset(self):
        queryset = TileCategory.objects.all()
        
        # Filter by active status if specified
        active = self.request.query_params.get('active')
        if active is not None:
            is_active = active.lower() == 'true'
            queryset = queryset.filter(active=is_active)
        
        return queryset.order_by('order', 'name')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class TileImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Tiles.
    """
    queryset = TileImage.objects.all()
    serializer_class = TileImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'material', 'sku']
    ordering_fields = ['created_at', 'price', 'title']
    
    def get_queryset(self):
        queryset = TileImage.objects.all()
        
        # Filter by category
        category = self.request.query_params.get('category')
        if category:
            # Support both id and slug lookup
            if category.isdigit():
                queryset = queryset.filter(category_id=category)
            else:
                queryset = queryset.filter(category__slug=category)
        
        # Filter by featured status
        featured = self.request.query_params.get('featured')
        if featured is not None:
            is_featured = featured.lower() == 'true'
            queryset = queryset.filter(featured=is_featured)
        
        # Filter by in_stock status
        in_stock = self.request.query_params.get('in_stock')
        if in_stock is not None:
            is_in_stock = in_stock.lower() == 'true'
            queryset = queryset.filter(in_stock=is_in_stock)
        
        # Filter by material
        material = self.request.query_params.get('material')
        if material:
            queryset = queryset.filter(material__icontains=material)
        
        # Filter by search term
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) | 
                Q(material__icontains=search) | 
                Q(sku__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Projects.
    """
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'client', 'location']
    ordering_fields = ['completed_date', 'created_at', 'title']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        queryset = Project.objects.all()
        
        # Filter by featured status
        featured = self.request.query_params.get('featured')
        if featured is not None:
            is_featured = featured.lower() == 'true'
            queryset = queryset.filter(featured=is_featured)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by search term
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) | 
                Q(client__icontains=search) | 
                Q(location__icontains=search)
            )
        
        return queryset.order_by('-completed_date')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class ProjectImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Project Images.
    """
    queryset = ProjectImage.objects.all()
    serializer_class = ProjectImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = ProjectImage.objects.all()
        
        # Filter by project if provided
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by is_primary
        is_primary = self.request.query_params.get('is_primary')
        if is_primary is not None:
            primary = is_primary.lower() == 'true'
            queryset = queryset.filter(is_primary=primary)
        
        return queryset.order_by('-is_primary', 'created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class ContactViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling contact form submissions.
    """
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def mark_responded(self, request, pk=None):
        contact = self.get_object()
        contact.responded = True
        contact.save()
        return Response({'status': 'marked as responded'})

class SubscriberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling newsletter subscriptions.
    """
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def subscribe(self, request):
        email = request.data.get('email')
        name = request.data.get('name', '')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already subscribed
        existing = Subscriber.objects.filter(email=email).first()
        if existing:
            if existing.active:
                return Response({'message': 'Already subscribed'}, status=status.HTTP_200_OK)
            else:
                # Re-activate if previously unsubscribed
                existing.active = True
                existing.save()
                return Response({'message': 'Subscription re-activated'}, status=status.HTTP_200_OK)
        
        # Create new subscriber
        subscriber = Subscriber(email=email, name=name)
        subscriber.save()
        
        return Response({'message': 'Successfully subscribed'}, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def unsubscribe(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        subscriber = get_object_or_404(Subscriber, email=email)
        subscriber.active = False
        subscriber.save()
        
        return Response({'message': 'Successfully unsubscribed'}, status=status.HTTP_200_OK)