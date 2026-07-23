import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# ============================================================================
# SECURITY
# ============================================================================
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False') == 'True'

# ✅ Production: Allow Render domain and Netlify frontend
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',') + [
    'localhost',
    '127.0.0.1',
    '.onrender.com',  # Render domain
]

# ============================================================================
# APPLICATION DEFINITION
# ============================================================================
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt',
    
    # Local apps
    'apps.users',
    'apps.courses',
    'apps.progress',
    'apps.certificates',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS first
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # ✅ For static files in production
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.users.middleware.TokenVerificationMiddleware', 
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ============================================================================
# URL CONFIGURATION
# ============================================================================
ROOT_URLCONF = 'aqualearn.urls'

# ============================================================================
# CUSTOM USER MODEL
# ============================================================================
AUTH_USER_MODEL = 'users.User'

# ============================================================================
# RATE LIMITING - CUSTOM IMPLEMENTATION
# ============================================================================
RATE_LIMIT = {
    'LOGIN': {
        'max_attempts': 5,
        'window_seconds': 300,  # 5 minutes
    },
    'REGISTER': {
        'max_attempts': 10,
        'window_seconds': 3600,  # 1 hour
    },
    'PASSWORD_RESET': {
        'max_attempts': 3,
        'window_seconds': 3600,  # 1 hour
    },
    'API': {
        'max_attempts': 100,
        'window_seconds': 60,  # 1 minute
    },
}

# ============================================================================
# REST FRAMEWORK CONFIGURATION
# ============================================================================
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# ============================================================================
# CORS CONFIGURATION
# ============================================================================
# ✅ Production: Allow Netlify frontend
CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', '').split(',') + [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://*.netlify.app',  # Netlify domain
]

CORS_ALLOW_CREDENTIALS = True

# ============================================================================
# JWT CONFIGURATION
# ============================================================================
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# ============================================================================
# FRONTEND URL
# ============================================================================
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ============================================================================
# CACHE CONFIGURATION
# ============================================================================
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'aqua-learn-cache',
    }
}

# ============================================================================
# STATIC & MEDIA FILES
# ============================================================================
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ✅ WhiteNoise for static files in production
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================
EMAIL_BACKEND = os.getenv('DJANGO_EMAIL_BACKEND', 'django.core.mail.backends.smtp.EmailBackend')
EMAIL_HOST = os.getenv('DJANGO_EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('DJANGO_EMAIL_PORT', 587))
EMAIL_USE_TLS = os.getenv('DJANGO_EMAIL_USE_TLS', 'True').lower() in ('true', '1', 't')
EMAIL_HOST_USER = os.getenv('DJANGO_EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('DJANGO_EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'AquaLearn <noreply@aqualearn.com>')
EMAIL_USE_HTML = True

# ============================================================================
# LOGGING CONFIGURATION
# ============================================================================
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
        },
        'apps.users': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# ============================================================================
# DEVELOPMENT-ONLY SETTINGS
# ============================================================================
if DEBUG:
    # Suppress cache warnings during development
    import warnings
    warnings.filterwarnings('ignore', module='django.core.cache')