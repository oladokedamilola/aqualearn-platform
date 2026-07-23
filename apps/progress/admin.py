from django.contrib import admin
from .models import UserProgress, CourseEnrollment


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    """User Progress Admin"""
    
    list_display = ['user', 'lesson', 'watch_percentage', 'quiz_passed', 'completed', 'last_watch_time']
    list_filter = ['completed', 'quiz_passed', 'watch_threshold_met']
    search_fields = ['user__email', 'lesson__title']
    readonly_fields = ['last_watch_time', 'completed_at', 'quiz_completed_at']
    raw_id_fields = ['user', 'lesson', 'course']
    
    fieldsets = (
        ('User & Lesson', {
            'fields': ('user', 'lesson', 'course')
        }),
        ('Watch Progress', {
            'fields': ('watch_percentage', 'watch_threshold_met', 'last_watch_time')
        }),
        ('Quiz Progress', {
            'fields': ('quiz_attempted', 'quiz_passed', 'quiz_score', 'quiz_attempts', 'quiz_completed_at')
        }),
        ('Completion', {
            'fields': ('completed', 'completed_at')
        }),
    )


@admin.register(CourseEnrollment)
class CourseEnrollmentAdmin(admin.ModelAdmin):
    """Course Enrollment Admin"""
    
    list_display = ['user', 'course', 'enrolled_at', 'is_completed', 'completed_at', 'progress_percentage_display']
    list_filter = ['is_completed']
    search_fields = ['user__email', 'course__title']
    raw_id_fields = ['user', 'course']
    readonly_fields = ['enrolled_at', 'completed_at']
    
    def progress_percentage_display(self, obj):
        return f"{obj.progress_percentage:.1f}%"
    progress_percentage_display.short_description = 'Progress'