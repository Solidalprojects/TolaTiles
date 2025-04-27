# server/api/urls.py - Update URLs to include the new tile-images endpoints

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
]