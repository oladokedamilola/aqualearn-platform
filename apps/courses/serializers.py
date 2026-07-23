from rest_framework import serializers
from .models import Course, Lesson, QuizQuestion

class QuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions"""
    
    class Meta:
        model = QuizQuestion
        fields = ['id', 'question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_option', 'explanation']
        extra_kwargs = {
            'correct_option': {'write_only': True},  # Hide correct answer in responses
        }

class LessonSerializer(serializers.ModelSerializer):
    """Serializer for lessons (list view)"""
    quiz_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'order', 'video_url', 'video_duration', 
                 'quiz_count', 'created_at', 'updated_at']
    
    def get_quiz_count(self, obj):
        return obj.quiz_questions.count()

class LessonDetailSerializer(serializers.ModelSerializer):
    """Serializer for lessons (detail view with quiz questions)"""
    quiz_questions = QuizQuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'description', 'order', 'video_url', 'video_duration', 
                 'quiz_questions', 'created_at', 'updated_at']

class CourseSerializer(serializers.ModelSerializer):
    """Serializer for courses (list view)"""
    lesson_count = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'level', 'image', 
                 'lesson_count', 'total_duration', 'created_at', 'updated_at']
    
    def get_lesson_count(self, obj):
        return obj.lesson_count
    
    def get_total_duration(self, obj):
        return obj.total_duration

class CourseDetailSerializer(serializers.ModelSerializer):
    """Serializer for courses (detail view with lessons)"""
    lessons = LessonSerializer(many=True, read_only=True)
    lesson_count = serializers.SerializerMethodField()
    total_duration = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'level', 'image', 
                 'lessons', 'lesson_count', 'total_duration', 'created_at', 'updated_at']
    
    def get_lesson_count(self, obj):
        return obj.lesson_count
    
    def get_total_duration(self, obj):
        return obj.total_duration