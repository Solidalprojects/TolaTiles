# server/api/middleware.py
from django.utils.deprecation import MiddlewareMixin
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class FileUploadMiddleware(MiddlewareMixin):
    
    def process_request(self, request):
        if request.method == 'POST' and request.content_type and 'multipart/form-data' in request.content_type:
            logger.info(f"File upload request to {request.path}")
            logger.info(f"Content Length: {request.META.get('CONTENT_LENGTH', 'Unknow')}")
            
            #Check content length
            content_length = request.META.get('CONTENT_LENGTH')
            if content_length:
                content_length = int(content_length)
                max_size = getattr(settings, 'DATA_UPLOAD_MAX_MEMORY_SIZE', 50 * 1024 * 1024)
                
                if content_length > max_size:
                    return JsonResponse({
                        'error': f'File too large. Maximum allowed is {max_size // (1024 * 1024)}MB',
                        'max_size-mb': max_size // (1024*1024),
                        'received_size_mb' : content_length // (1024*1024)
                    }, status=413)
        return None
    
    
    
    
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