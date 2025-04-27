# server/api/urls.py - Updated with new endpoints for product types, team, and testimonials

from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views
from .views_auth import admin_login

router = DefaultRouter()
router.register(r'categories', views.TileCategoryViewSet)
router.register(r'tiles', views.TileViewSet)
router.register(r'tile-images', views.TileImageViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'project-images', views.ProjectImageViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'subscribers', views.SubscriberViewSet)

# New ViewSet registrations
router.register(r'product-types', views.ProductTypeViewSet)
router.register(r'team', views.TeamMemberViewSet)
router.register(r'testimonials', views.CustomerTestimonialViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', admin_login, name='login'),
    path('auth/register/', views.register_view, name='register'),
    path('auth/user/', views.get_user_info, name='user_info'),
    path('auth/change-password/', views.change_password, name='change_password'),
    
    # Additional subscriber endpoints
    path('newsletter/subscribe/', views.SubscriberViewSet.as_view({'post': 'subscribe'}), name='subscribe'),
    path('newsletter/unsubscribe/', views.SubscriberViewSet.as_view({'post': 'unsubscribe'}), name='unsubscribe'),
    
    # Set image as primary
    path('tile-images/<int:pk>/set_as_primary/', views.TileImageViewSet.as_view({'post': 'set_as_primary'}), name='tile-image-set-primary'),
    path('project-images/<int:pk>/set_as_primary/', views.ProjectImageViewSet.as_view({'post': 'set_as_primary'}), name='project-image-set-primary'),
    
    # Category URLs with both ID and slug support
    re_path(r'^categories/(?P<slug>[\w-]+)/$', views.TileCategoryViewSet.as_view({'get': 'retrieve'}), name='category-detail'),
    
    # Tile URLs with both ID and slug support
    re_path(r'^tiles/(?P<slug>[\w-]+)/$', views.TileViewSet.as_view({'get': 'retrieve'}), name='tile-detail'),
    
    # Project URLs with both ID and slug support
    re_path(r'^projects/(?P<slug>[\w-]+)/$', views.ProjectViewSet.as_view({'get': 'retrieve'}), name='project-detail'),
    
    # Product Type URLs with both ID and slug support
    re_path(r'^product-types/(?P<slug>[\w-]+)/$', views.ProductTypeViewSet.as_view({'get': 'retrieve'}), name='product-type-detail'),
    
    # Testimonial actions
    path('testimonials/<int:pk>/approve/', views.CustomerTestimonialViewSet.as_view({'post': 'approve'}), name='testimonial-approve'),
    
    # Filtering tiles by product type
    path('tiles/by-product-type/<int:product_type_id>/', views.TileViewSet.as_view({'get': 'list'}), name='tiles-by-product-type'),
    path('tiles/by-product-type/<slug:product_type_slug>/', views.TileViewSet.as_view({'get': 'list'}), name='tiles-by-product-type-slug'),
    
    # Filtering projects by product type
    path('projects/by-product-type/<int:product_type_id>/', views.ProjectViewSet.as_view({'get': 'list'}), name='projects-by-product-type'),
    path('projects/by-product-type/<slug:product_type_slug>/', views.ProjectViewSet.as_view({'get': 'list'}), name='projects-by-product-type-slug'),
]