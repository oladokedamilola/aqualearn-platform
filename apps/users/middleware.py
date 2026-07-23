from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import re

class TokenVerificationMiddleware:
    """
    Middleware to verify JWT token on protected routes.
    Excludes public API endpoints (courses, registration, login, etc.).
    """
    
    def __init__(self, get_response):
        self.get_response = get_response
        # Routes that don't require authentication
        self.exempt_urls = [
            r'^/api/users/register/$',
            r'^/api/users/login/$',
            r'^/api/users/token/refresh/$',
            r'^/api/users/password-reset/$',
            r'^/api/users/password-reset-confirm/.*/$',
            r'^/api/users/verify-email/.*/$',
            r'^/api/users/resend-verification/$',
            r'^/api/courses/$',  # ✅ Add this
            r'^/api/courses/\d+/$',  # ✅ Add this for course detail
            r'^/api/courses/lessons/\d+/$',  # ✅ Add this for lesson detail
            r'^/api/certificates/verify/$',
            r'^/admin/.*$',
            r'^/api/health/$',
        ]
    
    def __call__(self, request):
        # Check if route is exempt
        path = request.path
        for exempt_url in self.exempt_urls:
            if re.match(exempt_url, path):
                return self.get_response(request)
        
        # Check if it's an API route
        if path.startswith('/api/'):
            # Get token from Authorization header
            auth_header = request.headers.get('Authorization', '')
            if not auth_header or not auth_header.startswith('Bearer '):
                return JsonResponse(
                    {'error': 'Authentication required'},
                    status=401
                )
            
            token = auth_header.split(' ')[1]
            try:
                # Validate token
                AccessToken(token)
            except InvalidToken:
                return JsonResponse(
                    {'error': 'Invalid or expired token'},
                    status=401
                )
            except TokenError as e:
                return JsonResponse(
                    {'error': str(e)},
                    status=401
                )
        
        return self.get_response(request)