# apps/users/models.py
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import uuid
from django.utils import timezone

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_verified', True)
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    EXPERIENCE_CHOICES = [
        ('beginner', 'Beginner - New to fish farming'),
        ('intermediate', 'Intermediate - Some experience'),
        ('advanced', 'Advanced - Experienced farmer'),
    ]
    
    # Authentication fields (email is the username)
    email = models.EmailField(unique=True)
    
    # Personal information
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    
    # Profile fields
    experience_level = models.CharField(
        max_length=20, 
        choices=EXPERIENCE_CHOICES,
        default='beginner'
    )
    profile_image = models.ImageField(upload_to='profiles/', blank=True, null=True)
    bio = models.TextField(blank=True, null=True, max_length=500)
    
    # Interests (stored as JSON or many-to-many)
    interests = models.JSONField(default=list, blank=True)
    
    # System fields
    is_active = models.BooleanField(default=False)  # Changed: False until email verified
    is_staff = models.BooleanField(default=False)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Onboarding status
    onboarding_completed = models.BooleanField(default=False)
    
    # Email verification
    email_verification_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    email_verified_at = models.DateTimeField(null=True, blank=True)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name
    
    def is_email_verified(self):
        """Check if user's email is verified"""
        return self.is_verified and self.is_active
    
    def verify_email(self):
        """Verify the user's email"""
        self.is_verified = True
        self.is_active = True
        self.email_verified_at = timezone.now()
        self.save()
    
    class Meta:
        db_table = 'users'
        
        
class OnboardingStep(models.Model):
    STEP_CHOICES = [
        ('experience', 'Experience Level'),
        ('interests', 'Interests'),
        ('profile', 'Profile Image & Bio'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='onboarding_steps')
    step = models.CharField(max_length=20, choices=STEP_CHOICES)
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'step']
        db_table = 'onboarding_steps'