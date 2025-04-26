# server/api/urls.py
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from . import views
from .views_auth import admin_login

router = DefaultRouter()
router.register(r'categories', views.TileCategoryViewSet)
router.register(r'tiles', views.TileImageViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'project-images', views.ProjectImageViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'subscribers', views.SubscriberViewSet)

urlpatterns = [
    path('', include(router.urls)),
    
    # Authentication endpoints
    path('auth/login/', admin_login, name='login'),
    path('auth/register/', views.register_view, name='register'),
    # Remove JWT endpoints
    # path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('auth/user/', views.get_user_info, name='user_info'),
    path('auth/change-password/', views.change_password, name='change_password'),
    
    # Additional subscriber endpoints
    path('newsletter/subscribe/', views.SubscriberViewSet.as_view({'post': 'subscribe'}), name='subscribe'),
    path('newsletter/unsubscribe/', views.SubscriberViewSet.as_view({'post': 'unsubscribe'}), name='unsubscribe'),
    
    # Category URLs with both ID and slug support
    re_path(r'^categories/(?P<slug>[\w-]+)/$', views.TileCategoryViewSet.as_view({'get': 'retrieve'}), name='category-detail'),
    
    # Tile URLs with both ID and slug support
    re_path(r'^tiles/(?P<slug>[\w-]+)/$', views.TileImageViewSet.as_view({'get': 'retrieve'}), name='tile-detail'),
    
    # Project URLs with both ID and slug support
    re_path(r'^projects/(?P<slug>[\w-]+)/$', views.ProjectViewSet.as_view({'get': 'retrieve'}), name='project-detail'),
]