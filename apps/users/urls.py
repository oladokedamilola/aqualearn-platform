from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, LoginView, UserProfileView,
    OnboardingExperienceView, OnboardingInterestsView, OnboardingProfileView,
    PasswordResetRequestView, PasswordResetConfirmView,
    VerifyEmailView, ResendVerificationEmailView
)

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', UserProfileView.as_view(), name='profile'),
    
    # Onboarding
    path('onboarding/experience/', OnboardingExperienceView.as_view(), name='onboarding_experience'),
    path('onboarding/interests/', OnboardingInterestsView.as_view(), name='onboarding_interests'),
    path('onboarding/profile/', OnboardingProfileView.as_view(), name='onboarding_profile'),
    
    # Password Reset
    path('password-reset/', PasswordResetRequestView.as_view(), name='password_reset'),
    path('password-reset-confirm/<str:uidb64>/<str:token>/', 
         PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    
    # Email Verification
    path('verify-email/<int:user_id>/<uuid:token>/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend_verification'),
    
]