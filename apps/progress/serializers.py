from rest_framework import serializers
from .models import UserProgress, CourseEnrollment
from apps.courses.models import Course, Lesson

class UserProgressSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    is_eligible_for_quiz = serializers.SerializerMethodField()
    can_retry = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'lesson', 'lesson_title', 'course', 'course_title',
            'watch_percentage', 'watch_threshold_met',
            'quiz_attempted', 'quiz_passed', 'quiz_score', 'quiz_attempts',
            'completed', 'completed_at', 'is_eligible_for_quiz', 'can_retry'
        ]
    
    def get_is_eligible_for_quiz(self, obj):
        return obj.is_eligible_for_quiz()
    
    def get_can_retry(self, obj):
        return obj.can_retry_quiz()

class CourseEnrollmentSerializer(serializers.ModelSerializer):
    progress_percentage = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_level = serializers.CharField(source='course.level', read_only=True)
    total_lessons = serializers.SerializerMethodField()
    completed_lessons = serializers.SerializerMethodField()
    
    class Meta:
        model = CourseEnrollment
        fields = [
            'id', 'course', 'course_title', 'course_level',
            'enrolled_at', 'completed_at', 'is_completed',
            'progress_percentage', 'total_lessons', 'completed_lessons'
        ]
    
    def get_progress_percentage(self, obj):
        return obj.progress_percentage
    
    def get_total_lessons(self, obj):
        return obj.course.lessons.count()
    
    def get_completed_lessons(self, obj):
        return UserProgress.objects.filter(
            user=obj.user,
            lesson__course=obj.course,
            completed=True
        ).count()

class WatchProgressUpdateSerializer(serializers.Serializer):
    percentage = serializers.FloatField(min_value=0, max_value=100)

class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.JSONField(help_text='Dictionary of question_id: selected_option')