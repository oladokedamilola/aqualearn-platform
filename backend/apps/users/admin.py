from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import User, OnboardingStep


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User Admin for AquaLearn"""
    
    list_display = ['email', 'first_name', 'last_name', 'is_active', 'is_verified', 'onboarding_completed', 'date_joined']
    list_filter = ['is_active', 'is_verified', 'is_staff', 'is_superuser', 'onboarding_completed', 'experience_level']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {'fields': ('first_name', 'last_name', 'profile_image', 'bio')}),
        (_('Profile'), {'fields': ('experience_level', 'interests')}),
        (_('Permissions'), {
            'fields': ('is_active', 'is_verified', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        (_('Onboarding'), {'fields': ('onboarding_completed',)}),
        (_('Email Verification'), {'fields': ('email_verification_token', 'email_verified_at')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined', 'updated_at')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['email_verification_token', 'email_verified_at', 'date_joined', 'updated_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()


@admin.register(OnboardingStep)
class OnboardingStepAdmin(admin.ModelAdmin):
    """Onboarding Step Admin"""
    
    list_display = ['user', 'step', 'completed', 'completed_at']
    list_filter = ['step', 'completed']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    raw_id_fields = ['user']
    readonly_fields = ['completed_at']