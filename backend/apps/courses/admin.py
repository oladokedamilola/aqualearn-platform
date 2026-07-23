from django.contrib import admin
from .models import Course, Lesson, QuizQuestion


class LessonInline(admin.TabularInline):
    """Inline lessons within course"""
    model = Lesson
    extra = 1
    fields = ['title', 'order', 'video_url', 'video_duration']
    ordering = ['order']
    show_change_link = True


class QuizQuestionInline(admin.TabularInline):
    """Inline quiz questions within lesson"""
    model = QuizQuestion
    extra = 3
    fields = ['question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_option', 'explanation']
    ordering = ['id']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Course Admin"""
    
    list_display = ['title', 'level', 'lesson_count_display', 'is_active', 'created_at']
    list_filter = ['level', 'is_active']
    search_fields = ['title', 'description']
    inlines = [LessonInline]
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'level', 'image')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def lesson_count_display(self, obj):
        return obj.lesson_count
    lesson_count_display.short_description = 'Lessons'


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Lesson Admin"""
    
    list_display = ['title', 'course', 'order', 'video_duration_display', 'quiz_count_display', 'created_at']
    list_filter = ['course']
    search_fields = ['title', 'description']
    inlines = [QuizQuestionInline]
    readonly_fields = ['created_at', 'updated_at']
    raw_id_fields = ['course']
    
    fieldsets = (
        ('Lesson Information', {
            'fields': ('course', 'title', 'description', 'order', 'video_url', 'video_duration')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def video_duration_display(self, obj):
        if obj.video_duration:
            minutes = obj.video_duration // 60
            seconds = obj.video_duration % 60
            return f"{minutes}m {seconds}s"
        return "0m 0s"
    video_duration_display.short_description = 'Duration'
    
    def quiz_count_display(self, obj):
        return obj.quiz_questions.count()
    quiz_count_display.short_description = 'Quiz Questions'


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    """Quiz Question Admin"""
    
    list_display = ['question_preview', 'lesson', 'correct_option_display', 'created_at']
    list_filter = ['lesson__course']
    search_fields = ['question', 'option_1', 'option_2', 'option_3', 'option_4']
    raw_id_fields = ['lesson']
    
    fieldsets = (
        ('Question', {
            'fields': ('lesson', 'question')
        }),
        ('Options', {
            'fields': ('option_1', 'option_2', 'option_3', 'option_4')
        }),
        ('Answer', {
            'fields': ('correct_option', 'explanation')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']
    
    def question_preview(self, obj):
        return obj.question[:60] + '...' if len(obj.question) > 60 else obj.question
    question_preview.short_description = 'Question'
    
    def correct_option_display(self, obj):
        options = ['A', 'B', 'C', 'D']
        return options[obj.correct_option - 1] if 1 <= obj.correct_option <= 4 else '—'
    correct_option_display.short_description = 'Answer'