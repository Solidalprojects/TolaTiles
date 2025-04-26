# server/api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'categories', views.TileCategoryViewSet)
router.register(r'tiles', views.TileImageViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'project-images', views.ProjectImageViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', views.login_view, name='login'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/user/', views.get_user_info, name='user_info'),
]