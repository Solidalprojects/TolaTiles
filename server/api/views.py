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
from .models import (
    TileCategory, TileImage, Project, ProjectImage, 
    Contact, Subscriber, Tile, ProductType, 
    TeamMember, CustomerTestimonial
)
from .serializers import (
    UserSerializer, TileCategorySerializer, TileCategoryDetailSerializer,
    TileImageSerializer, ProjectSerializer, ProjectDetailSerializer,
    ProjectImageSerializer, ContactSerializer, SubscriberSerializer, 
    TileSerializer, TileDetailSerializer, ProductTypeSerializer,
    ProductTypeDetailSerializer, TeamMemberSerializer,
    CustomerTestimonialSerializer
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

class ProductTypeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Product Types (Backsplash, Fireplace, etc.)
    """
    queryset = ProductType.objects.all()
    serializer_class = ProductTypeSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'display_order', 'created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProductTypeDetailSerializer
        return ProductTypeSerializer
    
    def get_object(self):
        """
        Custom get_object method to support both ID and slug lookups
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # Try to look up by ID first
        if lookup_value.isdigit():
            filter_kwargs = {'id': lookup_value}
        else:
            # Fall back to slug lookup
            filter_kwargs = {self.lookup_field: lookup_value}
        
        obj = get_object_or_404(self.get_queryset(), **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj
    
    def get_queryset(self):
        queryset = ProductType.objects.all()
        
        # Filter by active status if specified
        active = self.request.query_params.get('active')
        if active is not None:
            is_active = active.lower() == 'true'
            queryset = queryset.filter(active=is_active)
        
        return queryset.order_by('display_order', 'name')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class TeamMemberViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Team Members.
    """
    queryset = TeamMember.objects.all()
    serializer_class = TeamMemberSerializer
    permission_classes = [IsAdminOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'position', 'bio']
    ordering_fields = ['display_order', 'name', 'position']
    
    def get_queryset(self):
        queryset = TeamMember.objects.all()
        
        # Filter by active status if specified
        active = self.request.query_params.get('active')
        if active is not None:
            is_active = active.lower() == 'true'
            queryset = queryset.filter(active=is_active)
        
        # Filter by position if specified
        position = self.request.query_params.get('position')
        if position:
            queryset = queryset.filter(position__icontains=position)
        
        return queryset.order_by('display_order', 'name')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context

class CustomerTestimonialViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Customer Testimonials.
    """
    queryset = CustomerTestimonial.objects.all()
    serializer_class = CustomerTestimonialSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['customer_name', 'location', 'testimonial']
    ordering_fields = ['date', 'rating']
    
    def get_permissions(self):
        if self.action in ['create', 'list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = CustomerTestimonial.objects.all()
        
        # By default, only show approved testimonials to non-admin users
        if not self.request.user.is_staff:
            queryset = queryset.filter(approved=True)
        
        # Filter by approval status if specified (admin only)
        if self.request.user.is_staff:
            approved = self.request.query_params.get('approved')
            if approved is not None:
                is_approved = approved.lower() == 'true'
                queryset = queryset.filter(approved=is_approved)
        
        # Filter by project if specified
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        
        # Filter by rating if specified
        rating = self.request.query_params.get('rating')
        if rating and rating.isdigit():
            queryset = queryset.filter(rating=int(rating))
        
        # Filter by minimum rating if specified
        min_rating = self.request.query_params.get('min_rating')
        if min_rating and min_rating.isdigit():
            queryset = queryset.filter(rating__gte=int(min_rating))
        
        return queryset.order_by('-date')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Approve or unapprove a testimonial"""
        testimonial = self.get_object()
        
        # Toggle the approved status
        testimonial.approved = not testimonial.approved
        testimonial.save()
        
        status_msg = 'approved' if testimonial.approved else 'unapproved'
        return Response({'status': f'Testimonial has been {status_msg}'})
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set approved to False by default for user-submitted testimonials
        testimonial = serializer.save(approved=False)
        
        # Admin-submitted testimonials can be automatically approved
        if request.user.is_staff and request.data.get('approved'):
            testimonial.approved = True
            testimonial.save()
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, 
            status=status.HTTP_201_CREATED, 
            headers=headers
        )

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
    
    def get_object(self):
        """
        Custom get_object method to support both ID and slug lookups
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # Try to look up by ID first
        if lookup_value.isdigit():
            filter_kwargs = {'id': lookup_value}
        else:
            # Fall back to slug lookup
            filter_kwargs = {self.lookup_field: lookup_value}
        
        obj = get_object_or_404(self.get_queryset(), **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj
    
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
    ViewSet for managing Tile Images.
    """
    queryset = TileImage.objects.all()
    serializer_class = TileImageSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        queryset = TileImage.objects.all()
        
        # Filter by tile if provided
        tile_id = self.request.query_params.get('tile')
        if tile_id:
            queryset = queryset.filter(tile_id=tile_id)
        
        # Filter by is_primary
        is_primary = self.request.query_params.get('is_primary')
        if is_primary is not None:
            primary = is_primary.lower() == 'true'
            queryset = queryset.filter(is_primary=primary)
        
        return queryset.order_by('-is_primary', 'created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        return context
    
    def perform_create(self, serializer):
        # When creating a new image, make sure only one is primary per tile
        new_image = serializer.save()
        if new_image.is_primary:
            # Ensure no other images for this tile are primary
            TileImage.objects.filter(tile=new_image.tile, is_primary=True).exclude(id=new_image.id).update(is_primary=False)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def set_as_primary(self, request, pk=None):
        """Set this image as primary for its parent tile"""
        image = self.get_object()
        
        # Set this image as primary
        image.is_primary = True
        image.save()  # The model's save method handles updating other images
        
        return Response({'status': 'set as primary image'})
    
    
class TileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing Tiles.
    """
    queryset = Tile.objects.all()
    serializer_class = TileSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'material', 'sku']
    ordering_fields = ['created_at', 'price', 'title']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TileDetailSerializer
        return TileSerializer
    
    def get_object(self):
        """
        Custom get_object method to support both ID and slug lookups
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # Try to look up by ID first
        if lookup_value.isdigit():
            filter_kwargs = {'id': lookup_value}
        else:
            # Fall back to slug lookup
            filter_kwargs = {self.lookup_field: lookup_value}
        
        obj = get_object_or_404(self.get_queryset(), **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj
    
    def get_queryset(self):
        queryset = Tile.objects.all()
        
        # Filter by product type
        product_type = self.request.query_params.get('product_type')
        if product_type:
            # Support both id and slug lookup
            if product_type.isdigit():
                queryset = queryset.filter(product_type_id=product_type)
            else:
                queryset = queryset.filter(product_type__slug=product_type)
        
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
    
    def create(self, request, *args, **kwargs):
        """Custom create method to handle tile and its images"""
        # Extract and remove images data from request
        images_data = []
        
        # Handle the tile data first
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tile = serializer.save()
        
        # Process images if available
        if 'images' in request.data:
            images = request.FILES.getlist('images')
            is_primary = request.data.get('primary_image', 0)
            
            # Convert is_primary to int if it's a string
            try:
                is_primary = int(is_primary)
            except (ValueError, TypeError):
                is_primary = 0
            
            for i, image_file in enumerate(images):
                # Set as primary if it's the first image or if it matches the primary index
                TileImage.objects.create(
                    tile=tile,
                    image=image_file,
                    is_primary=(i == is_primary)
                )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Custom update method to handle images"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Process new images if available
        if 'images' in request.data:
            images = request.FILES.getlist('images')
            is_primary = request.data.get('primary_image', None)
            
            # Convert is_primary to int if it's a string
            try:
                is_primary = int(is_primary) if is_primary is not None else None
            except (ValueError, TypeError):
                is_primary = None
            
            for i, image_file in enumerate(images):
                # Set as primary if specified
                TileImage.objects.create(
                    tile=instance,
                    image=image_file,
                    is_primary=(is_primary is not None and i == is_primary)
                )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)

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
    
    def get_object(self):
        """
        Custom get_object method to support both ID and slug lookups
        """
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        
        assert lookup_url_kwarg in self.kwargs, (
            'Expected view %s to be called with a URL keyword argument '
            'named "%s". Fix your URL conf, or set the `.lookup_field` '
            'attribute on the view correctly.' %
            (self.__class__.__name__, lookup_url_kwarg)
        )
        
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        # Try to look up by ID first
        if lookup_value.isdigit():
            filter_kwargs = {'id': lookup_value}
        else:
            # Fall back to slug lookup
            filter_kwargs = {self.lookup_field: lookup_value}
        
        obj = get_object_or_404(self.get_queryset(), **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj
    
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
        
    def create(self, request, *args, **kwargs):
        """Custom create method to handle project and its images"""
        # Handle the project data first
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        
        # Process images if available
        if 'images' in request.FILES:
            images = request.FILES.getlist('images')
            is_primary = request.data.get('primary_image', 0)
            
            # Convert is_primary to int if it's a string
            try:
                is_primary = int(is_primary)
            except (ValueError, TypeError):
                is_primary = 0
            
            for i, image_file in enumerate(images):
                caption = request.data.get(f'caption_{i}', '')
                
                # Create project image with correct project reference
                ProjectImage.objects.create(
                    project=project,
                    image=image_file,
                    caption=caption,
                    is_primary=(i == is_primary)
                )
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
    def update(self, request, *args, **kwargs):
        """Custom update method to handle images"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        # Process new images if available
        if 'images' in request.FILES:
            images = request.FILES.getlist('images')
            is_primary = request.data.get('primary_image', None)
            
            # Convert is_primary to int if it's a string
            try:
                is_primary = int(is_primary) if is_primary is not None else None
            except (ValueError, TypeError):
                is_primary = None
            
            for i, image_file in enumerate(images):
                caption = request.data.get(f'caption_{i}', '')
                
                # Create project image
                ProjectImage.objects.create(
                    project=instance,
                    image=image_file,
                    caption=caption,
                    is_primary=(is_primary is not None and i == is_primary)
                )
        
        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}
        
        return Response(serializer.data)

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

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def set_as_primary(self, request, pk=None):
        """Set this image as primary for its parent project"""
        image = self.get_object()
        
        # Set this image as primary
        image.is_primary = True
        image.save()
        
        # Ensure no other images for this project are primary
        ProjectImage.objects.filter(project=image.project, is_primary=True).exclude(id=image.id).update(is_primary=False)
        
        return Response({'status': 'set as primary image'})

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