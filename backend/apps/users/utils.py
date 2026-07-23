import time
from django.core.cache import cache
from django.conf import settings

class RateLimiter:
    """
    Simple rate limiter using Django's cache backend.
    Works with any cache backend including LocMemCache.
    """
    
    def __init__(self, key_prefix, max_attempts=5, window_seconds=60):
        """
        Initialize rate limiter.
        
        Args:
            key_prefix: Prefix for cache key (e.g., 'login', 'register')
            max_attempts: Maximum allowed attempts in the time window
            window_seconds: Time window in seconds
        """
        self.key_prefix = key_prefix
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
    
    def get_cache_key(self, identifier):
        """Generate cache key for a specific identifier"""
        return f"ratelimit_{self.key_prefix}_{identifier}"
    
    def is_allowed(self, identifier):
        """
        Check if request is allowed under rate limit.
        
        Returns:
            (allowed: bool, remaining_attempts: int, reset_time: int)
        """
        cache_key = self.get_cache_key(identifier)
        current_time = time.time()
        
        # Get existing attempts
        attempts_data = cache.get(cache_key)
        
        if not attempts_data:
            # First attempt
            attempts = [current_time]
            cache.set(cache_key, attempts, timeout=self.window_seconds)
            return True, self.max_attempts - 1, int(current_time + self.window_seconds)
        
        # Clean old attempts outside the window
        window_start = current_time - self.window_seconds
        valid_attempts = [t for t in attempts_data if t > window_start]
        
        if len(valid_attempts) >= self.max_attempts:
            # Rate limit exceeded
            oldest_attempt = min(valid_attempts)
            reset_time = int(oldest_attempt + self.window_seconds)
            return False, 0, reset_time
        
        # Add new attempt
        valid_attempts.append(current_time)
        cache.set(cache_key, valid_attempts, timeout=self.window_seconds)
        
        remaining = self.max_attempts - len(valid_attempts)
        reset_time = int(current_time + self.window_seconds)
        
        return True, remaining, reset_time
    
    def reset(self, identifier):
        """Reset rate limit for a specific identifier"""
        cache_key = self.get_cache_key(identifier)
        cache.delete(cache_key)


# Pre-configured rate limiters
login_rate_limiter = RateLimiter('login', max_attempts=5, window_seconds=300)  # 5 attempts per 5 minutes
register_rate_limiter = RateLimiter('register', max_attempts=10, window_seconds=3600)  # 10 attempts per hour
password_reset_rate_limiter = RateLimiter('password_reset', max_attempts=3, window_seconds=3600)  # 3 attempts per hour
api_rate_limiter = RateLimiter('api', max_attempts=100, window_seconds=60)  # 100 requests per minute


def check_rate_limit(rate_limiter, identifier, request=None):
    """
    Decorator-like function to check rate limits.
    Returns (allowed, response_data) tuple.
    """
    allowed, remaining, reset_time = rate_limiter.is_allowed(identifier)
    
    if not allowed:
        return False, {
            'error': 'Too many attempts. Please try again later.',
            'retry_after': reset_time - int(time.time()),
            'reset_time': reset_time
        }
    
    return True, {
        'remaining_attempts': remaining,
        'reset_time': reset_time
    }