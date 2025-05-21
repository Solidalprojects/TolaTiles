# server/api/views_proxy.py
import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)

# Define supported client sites with their configurations
SUPPORTED_CLIENT_SITES = {
    'https://tolatiles.com': {
        'name': 'TolaTiles',
        'login_endpoint': 'https://tolatiles.com/api/auth/login/',
        'admin_path': '/admin/',
        'custom_redirect_url': 'https://tolatiles.com/auth/dashboard'
    }
}

@api_view(['POST'])
@permission_classes([AllowAny])
def proxy_client_login(request):
    """
    Proxy login requests to client websites to avoid CORS issues
    """
    try:
        client_domain = request.data.get('client_domain')
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not all([client_domain, username, password]):
            return Response(
                {'error': 'client_domain, username, and password are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if the client domain is supported
        if client_domain not in SUPPORTED_CLIENT_SITES:
            return Response(
                {'error': f'Client domain {client_domain} is not supported'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        client_config = SUPPORTED_CLIENT_SITES[client_domain]
        login_endpoint = client_config['login_endpoint']
        
        logger.info(f"Proxying login request to {login_endpoint} for user {username}")
        
        # Make the login request to the client site
        response = requests.post(
            login_endpoint,
            json={'username': username, 'password': password},
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        
        if response.status_code == 200:
            # Login successful
            response_data = response.json()
            token = response_data.get('token')
            user = response_data.get('user')
            
            if not token:
                return Response(
                    {'error': 'No token received from client site'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Determine redirect URL
            redirect_url = client_config.get('custom_redirect_url')
            if not redirect_url:
                admin_path = client_config.get('admin_path', '/admin/')
                redirect_url = f"{client_domain}{admin_path}"
            
            return Response({
                'token': token,
                'redirect_url': redirect_url,
                'user': user,
                'client_domain': client_domain
            })
        
        elif response.status_code == 401:
            return Response(
                {'error': 'Invalid username or password'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        elif response.status_code == 403:
            return Response(
                {'error': 'Access denied. You may not have permission to access this site.'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        else:
            logger.error(f"Client login failed with status {response.status_code}: {response.text}")
            return Response(
                {'error': f'Login failed: {response.status_code}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
    except requests.exceptions.Timeout:
        return Response(
            {'error': 'Request timeout. The client website may be unavailable.'}, 
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except requests.exceptions.ConnectionError:
        return Response(
            {'error': 'Unable to connect to the client website. Please try again later.'}, 
            status=status.HTTP_502_BAD_GATEWAY
        )
    except Exception as e:
        logger.error(f"Proxy login error: {str(e)}")
        return Response(
            {'error': 'An unexpected error occurred'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )