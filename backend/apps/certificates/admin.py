from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    """Certificate Admin"""
    
    list_display = ['certificate_id', 'user', 'course', 'issued_at', 'download_count', 'is_active']
    list_filter = ['is_active', 'issued_at']
    search_fields = ['certificate_id', 'user__email', 'user__first_name', 'user__last_name', 'course__title']
    readonly_fields = ['certificate_id', 'issued_at', 'download_count']
    raw_id_fields = ['user', 'course']
    
    fieldsets = (
        ('Certificate Information', {
            'fields': ('certificate_id', 'user', 'course')
        }),
        ('Status & Verification', {
            'fields': ('is_active', 'verification_url')
        }),
        ('Statistics', {
            'fields': ('download_count', 'issued_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'course')