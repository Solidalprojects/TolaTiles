# server/api/middleware.py
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.contrib.auth.models import User

class CrossDomainAuthMiddleware(MiddlewareMixin):
    """
    Middleware that checks for token in Authorization header
    and authenticates the user if a valid token is found.
    This allows frontend apps to use a token from the REST API
    to access the admin interface.
    """
    
    def process_request(self, request):
        # Skip middleware for admin login page to avoid loops
        if request.path == '/admin/login/' or request.path == '/api/auth/login/':
            return None
            
        # Check if user is already authenticated
        if request.user.is_authenticated:
            return None
            
        # Check for token in Authorization header
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        if auth_header.startswith('Token '):
            token_key = auth_header.split(' ')[1]
            
            try:
                # Look up the token
                token = Token.objects.get(key=token_key)
                
                # Get the user associated with this token
                user = token.user
                
                # Authenticate the user for this request
                request.user = user
                login(request, user)
            except Token.DoesNotExist:
                # Token not found, continue with unauthenticated request
                pass
                
        return None