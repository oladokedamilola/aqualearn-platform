"""
AquaLearn User Management Views

This module contains all views for user authentication, profile management,
onboarding, password reset, and email verification functionality.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail, EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django.db import transaction
import uuid
from .models import User
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    OnboardingExperienceSerializer, OnboardingInterestsSerializer,
    OnboardingProfileSerializer
)
from .utils import login_rate_limiter, register_rate_limiter, password_reset_rate_limiter
from .decorators import rate_limit_ip, rate_limit_email


# ============================================================================
# AUTHENTICATION VIEWS
# ============================================================================

class RegisterView(generics.CreateAPIView):
    """
    User Registration View
    
    Handles new user registration. Creates a user account with email as the
    unique identifier (username). Sends verification email to the user.
    
    Request Body:
        - email: str (required) - User's email address
        - first_name: str (required) - User's first name
        - last_name: str (required) - User's last name
        - password: str (required) - Password (min 8 chars)
        - password2: str (required) - Password confirmation
    
    Response:
        - message: str (success message)
        - user_id: int (user ID for verification)
        - requires_verification: bool (true if email verification required)
    """
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    
    @rate_limit_ip(register_rate_limiter)
    def post(self, request, *args, **kwargs):
        """
        Process registration request with rate limiting (10 attempts per hour per IP)
        """
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # Create user (inactive until email verification)
                user = serializer.save(is_active=False, is_verified=False)
                
                # Generate verification token if not already set
                if not user.email_verification_token:
                    user.email_verification_token = uuid.uuid4()
                    user.save()
                
                # Build verification link
                frontend_url = settings.FRONTEND_URL
                verification_link = f"{frontend_url}/verify-email/{user.id}/{user.email_verification_token}/"
                
                # Send verification email as HTML
                try:
                    subject = 'Verify Your Email - AquaLearn'
                    html_message = render_to_string('users/email_verification.html', {
                        'user': user,
                        'verification_link': verification_link,
                        'site_name': 'AquaLearn',
                    })
                    plain_message = strip_tags(html_message)
                    
                    email = EmailMultiAlternatives(
                        subject,
                        plain_message,
                        settings.DEFAULT_FROM_EMAIL,
                        [user.email]
                    )
                    email.attach_alternative(html_message, "text/html")
                    email.send()
                    
                except Exception as e:
                    print(f"Email sending error: {e}")
                
                return Response({
                    'message': 'Registration successful! Please check your email to verify your account.',
                    'user_id': user.id,
                    'email': user.email,
                    'requires_verification': True
                }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """
    Email Verification View
    
    Verifies user's email address using the token sent via email.
    Activates the user account upon successful verification.
    
    URL Parameters:
        - user_id: int (user ID)
        - token: uuid (verification token)
    
    Response:
        - message: str (success/error message)
        - verified: bool (true if verification successful)
        - user: User object (if verified)
        - refresh: Refresh token (if verified)
        - access: Access token (if verified)
        - onboarding_required: bool (if onboarding is required)
    """
    permission_classes = [AllowAny]
    
    def get(self, request, user_id, token):
        """
        Process email verification
        """
        try:
            user = User.objects.get(id=user_id, email_verification_token=token)
        except User.DoesNotExist:
            return Response({
                'error': 'Invalid verification link',
                'verified': False
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if user.is_verified and user.is_active:
            return Response({
                'message': 'Email already verified. Please login.',
                'already_verified': True,
                'verified': True
            }, status=status.HTTP_200_OK)
        
        # Verify the user
        user.is_verified = True
        user.is_active = True
        user.email_verified_at = timezone.now()
        user.save()
        
        # Generate JWT tokens for auto-login
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'message': 'Email verified successfully!',
            'verified': True,
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'onboarding_required': not user.onboarding_completed
        }, status=status.HTTP_200_OK)


class ResendVerificationEmailView(APIView):
    """
    Resend Verification Email View
    
    Resends the email verification link to the user's email address.
    
    Request Body:
        - email: str (required) - User's email address
    
    Response:
        - message: str (success message)
    """
    permission_classes = [AllowAny]
    
    @rate_limit_email(password_reset_rate_limiter)
    def post(self, request):
        """
        Resend verification email with rate limiting (3 attempts per hour per email)
        """
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'error': 'Email is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return success even if user doesn't exist (security)
            return Response({
                'message': 'If an account exists, a verification link has been sent.'
            }, status=status.HTTP_200_OK)
        
        if user.is_verified and user.is_active:
            return Response({
                'message': 'Email already verified. Please login.',
                'already_verified': True
            }, status=status.HTTP_200_OK)
        
        # Generate new token if needed
        if not user.email_verification_token:
            user.email_verification_token = uuid.uuid4()
            user.save()
        
        # Build verification link
        frontend_url = settings.FRONTEND_URL
        verification_link = f"{frontend_url}/verify-email/{user.id}/{user.email_verification_token}/"
        
        # Send verification email as HTML
        try:
            subject = 'Verify Your Email - AquaLearn'
            html_message = render_to_string('users/email_verification.html', {
                'user': user,
                'verification_link': verification_link,
                'site_name': 'AquaLearn',
            })
            plain_message = strip_tags(html_message)
            
            email = EmailMultiAlternatives(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
            email.attach_alternative(html_message, "text/html")
            email.send()
            
        except Exception as e:
            return Response({
                'error': 'Failed to send verification email. Please try again.'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'message': 'Verification email has been resent successfully.'
        }, status=status.HTTP_200_OK)


class LoginView(generics.GenericAPIView):
    """
    User Login View
    
    Authenticates a user using email and password. Returns JWT tokens
    upon successful authentication. Implements rate limiting to prevent
    brute force attacks.
    
    Request Body:
        - email: str (required) - User's email address
        - password: str (required) - User's password
    
    Response:
        - If email verified:
            - user: User object
            - refresh: Refresh token
            - access: Access token
            - onboarding_required: boolean
            - verified: True
        - If email not verified:
            - verified: False
            - message: "Please verify your email"
            - user_id: int
            - email: str
            - requires_verification: True
        - If invalid credentials:
            - error: "Invalid email or password"
    """
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer
    
    @rate_limit_ip(login_rate_limiter)
    def post(self, request):
        """
        Process login request with rate limiting (5 attempts per 5 minutes per IP)
        """
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract validated credentials
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        print(f"🔵 Login attempt for email: {email}")
        
        # Try to get user by email first
        try:
            user = User.objects.get(email=email)
            print(f"🔵 User found: {user.email}")
            print(f"🔵 is_active: {user.is_active}")
            print(f"🔵 is_verified: {user.is_verified}")
            print(f"🔵 onboarding_completed: {user.onboarding_completed}")
        except User.DoesNotExist:
            print(f"🔴 User not found: {email}")
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        # Check if password is correct
        if not user.check_password(password):
            print(f"🔴 Invalid password for: {email}")
            return Response({
                'error': 'Invalid email or password'
            }, status=status.HTTP_401_UNAUTHORIZED)
        
        print(f"✅ Password correct for: {email}")
        
        # Check if email is verified
        if not user.is_verified or not user.is_active:
            print(f"🔴 Email not verified for: {email}")
            
            # Generate a new verification token if needed
            if not user.email_verification_token:
                user.email_verification_token = uuid.uuid4()
                user.save()
            
            # Build verification link
            frontend_url = settings.FRONTEND_URL
            verification_link = f"{frontend_url}/verify-email/{user.id}/{user.email_verification_token}/"
            
            # Send verification email
            try:
                subject = 'Verify Your Email - AquaLearn'
                html_message = render_to_string('users/email_verification.html', {
                    'user': user,
                    'verification_link': verification_link,
                    'site_name': 'AquaLearn',
                })
                plain_message = strip_tags(html_message)
                
                email_message = EmailMultiAlternatives(
                    subject,
                    plain_message,
                    settings.DEFAULT_FROM_EMAIL,
                    [user.email]
                )
                email_message.attach_alternative(html_message, "text/html")
                email_message.send()
                print(f"📧 Verification email sent to: {email}")
                
            except Exception as e:
                print(f"❌ Email sending error: {e}")
            
            return Response({
                'verified': False,
                'message': 'Please verify your email. A new verification link has been sent.',
                'user_id': user.id,
                'email': user.email,
                'requires_verification': True
            }, status=status.HTTP_403_FORBIDDEN)
        
        # User is verified and active - generate JWT tokens
        print(f"✅ User verified and active: {email}")
        refresh = RefreshToken.for_user(user)
        
        onboarding_required = not user.onboarding_completed
        print(f"🔵 onboarding_required: {onboarding_required}")
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'onboarding_required': onboarding_required,
            'verified': True
        }, status=status.HTTP_200_OK)


# ============================================================================
# USER PROFILE VIEWS
# ============================================================================

class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    User Profile View
    
    Allows authenticated users to retrieve and update their own profile.
    Supports partial updates (PATCH).
    
    Response:
        - id: int
        - email: str
        - first_name: str
        - last_name: str
        - full_name: str
        - experience_level: str
        - profile_image: str (URL)
        - bio: str
        - interests: list
        - onboarding_completed: bool
        - date_joined: datetime
        - is_verified: bool
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UserSerializer
    
    def get_object(self):
        """
        Return the current authenticated user
        """
        return self.request.user


# ============================================================================
# ONBOARDING VIEWS (3-Step Process)
# ============================================================================

class OnboardingExperienceView(APIView):
    """
    Onboarding Step 1: Experience Level
    
    Updates the user's fish farming experience level.
    
    Request Body:
        - experience_level: str (required) - 'beginner', 'intermediate', or 'advanced'
    
    Response:
        - status: str
        - next_step: str (indicates next onboarding step)
        - data: Updated user data
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Save user's experience level
        """
        serializer = OnboardingExperienceSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'next_step': 'interests',  # Proceed to step 2
                'data': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OnboardingInterestsView(APIView):
    """
    Onboarding Step 2: Interests
    
    Updates the user's fish farming interests. This is optional.
    
    Request Body:
        - interests: list (optional) - List of interest strings
          Options: tilapia, catfish, pond_management, feed_management,
                   water_quality, health_management, harvesting, business
    
    Response:
        - status: str
        - next_step: str (indicates next onboarding step)
        - data: Updated user data
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Save user's interests
        """
        serializer = OnboardingInterestsSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response({
                'status': 'success',
                'next_step': 'profile',  # Proceed to step 3
                'data': serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OnboardingProfileView(APIView):
    """
    Onboarding Step 3: Profile Completion
    
    Completes the onboarding process. Updates profile image and bio,
    then marks onboarding as completed.
    
    Request Body:
        - profile_image: file (optional) - User's profile picture
        - bio: str (optional) - Short biography
    
    Response:
        - status: str
        - message: str
        - user: Complete user object
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """
        Complete onboarding by saving profile details
        """
        print("🔵 OnboardingProfileView - Request data:", request.data)
        print("🔵 OnboardingProfileView - FILES:", request.FILES)
        
        # ✅ Handle FormData properly
        data = request.data.copy() if hasattr(request.data, 'copy') else request.data
        
        # If profile_image is in FILES, add it to data
        if 'profile_image' in request.FILES:
            data['profile_image'] = request.FILES['profile_image']
        
        # If bio is in data, keep it
        serializer = OnboardingProfileSerializer(
            request.user, 
            data=data, 
            partial=True
        )
        
        if serializer.is_valid():
            # Save the data - this will also set onboarding_completed=True
            serializer.save()
            return Response({
                'status': 'success',
                'message': 'Onboarding completed successfully!',
                'user': UserSerializer(request.user).data
            })
        
        print("🔴 Serializer errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# PASSWORD RESET VIEWS
# ============================================================================

class PasswordResetRequestView(APIView):
    """
    Password Reset Request View
    
    Sends a password reset link to the user's email address.
    Uses Django's built-in token generator for secure reset links.
    
    Request Body:
        - email: str (required) - User's email address
    
    Response:
        - message: str (success message)
    
    Security Note:
        - Returns same response whether email exists or not (prevents user enumeration)
        - Reset links expire after the token's timeout period
        - Rate limited to 3 attempts per hour per email
    """
    permission_classes = [AllowAny]
    
    @rate_limit_email(password_reset_rate_limiter)
    def post(self, request):
        """
        Process password reset request with rate limiting (3 attempts per hour per email)
        """
        email = request.data.get('email')
        
        # Validate email presence
        if not email:
            return Response(
                {'error': 'Email is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Return success even if user doesn't exist (security best practice)
            # This prevents attackers from enumerating users
            return Response({
                'message': 'If an account exists with this email, a reset link has been sent.'
            }, status=status.HTTP_200_OK)
        
        # Generate secure token and user ID
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Build the frontend reset URL
        frontend_url = settings.FRONTEND_URL
        reset_link = f"{frontend_url}/reset-password/{uid}/{token}/"
        
        # Send the reset email as HTML
        try:
            subject = 'Reset Your AquaLearn Password'
            html_message = render_to_string('users/password_reset_email.html', {
                'user': user,
                'reset_link': reset_link,
                'site_name': 'AquaLearn',
            })
            plain_message = strip_tags(html_message)
            
            email = EmailMultiAlternatives(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                [user.email]
            )
            email.attach_alternative(html_message, "text/html")
            email.send()
            
        except Exception as e:
            return Response(
                {'error': 'Failed to send reset email. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'message': 'Password reset link has been sent to your email.'
        }, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    Password Reset Confirmation View
    
    Confirms the password reset token and sets a new password for the user.
    
    URL Parameters:
        - uidb64: str (base64 encoded user ID)
        - token: str (reset token)
    
    Request Body:
        - password: str (required) - New password (min 8 chars)
        - password2: str (required) - New password confirmation
    
    Response:
        - message: str (success message)
        - error: str (error message if any)
    
    Security Note:
        - Validates token before accepting new password
        - Tokens expire after timeout (default: 24 hours)
    """
    permission_classes = [AllowAny]
    
    def post(self, request, uidb64, token):
        """
        Process password reset confirmation
        """
        # Decode and retrieve the user
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response(
                {'error': 'Invalid reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate the token
        if not default_token_generator.check_token(user, token):
            return Response(
                {'error': 'Invalid or expired reset link'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate and set new password
        password = request.data.get('password')
        password2 = request.data.get('password2')
        
        # Check both password fields are provided
        if not password or not password2:
            return Response(
                {'error': 'Both password fields are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check passwords match
        if password != password2:
            return Response(
                {'error': 'Passwords do not match'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check minimum length
        if len(password) < 8:
            return Response(
                {'error': 'Password must be at least 8 characters'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set the new password and save
        user.set_password(password)
        user.save()
        
        return Response({
            'message': 'Password has been reset successfully. Please login with your new password.'
        }, status=status.HTTP_200_OK)