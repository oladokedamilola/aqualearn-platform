from functools import wraps
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
import time
from .utils import check_rate_limit

def rate_limit(rate_limiter, identifier_func=None):
    """
    Decorator for rate limiting API views.
    
    Args:
        rate_limiter: RateLimiter instance
        identifier_func: Function that returns identifier string from request.
                         If None, uses IP address.
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            # Get identifier
            if identifier_func:
                identifier = identifier_func(request)
            else:
                # Use IP address as default identifier
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    identifier = x_forwarded_for.split(',')[0]
                else:
                    identifier = request.META.get('REMOTE_ADDR', 'unknown')
            
            # Add method to identifier for different rate limits per endpoint
            identifier = f"{identifier}_{request.method}"
            
            # Check rate limit
            allowed, data = check_rate_limit(rate_limiter, identifier)
            
            if not allowed:
                return Response(data, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            # Add rate limit headers
            response = view_func(self, request, *args, **kwargs)
            
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Remaining'] = data['remaining_attempts']
                response.headers['X-RateLimit-Reset'] = data['reset_time']
            
            return response
        
        return wrapper
    return decorator


def rate_limit_ip(rate_limiter):
    """Simpler decorator that uses IP address as identifier"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            # Get IP address
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR', 'unknown')
            
            identifier = f"{ip}_{request.method}"
            
            allowed, data = check_rate_limit(rate_limiter, identifier)
            
            if not allowed:
                return Response(data, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            response = view_func(self, request, *args, **kwargs)
            
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Remaining'] = data['remaining_attempts']
                response.headers['X-RateLimit-Reset'] = data['reset_time']
            
            return response
        
        return wrapper
    return decorator


def rate_limit_email(rate_limiter):
    """Decorator that uses email as identifier"""
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, request, *args, **kwargs):
            email = request.data.get('email', 'unknown')
            identifier = f"{email}_{request.method}"
            
            allowed, data = check_rate_limit(rate_limiter, identifier)
            
            if not allowed:
                return Response(data, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
            response = view_func(self, request, *args, **kwargs)
            
            if hasattr(response, 'headers'):
                response.headers['X-RateLimit-Remaining'] = data['remaining_attempts']
                response.headers['X-RateLimit-Reset'] = data['reset_time']
            
            return response
        
        return wrapper
    return decorator