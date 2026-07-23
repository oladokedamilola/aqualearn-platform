# apps/certificates/serializers.py
from rest_framework import serializers
from .models import Certificate
from apps.courses.serializers import CourseSerializer

class CertificateSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source='user.email', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_level = serializers.CharField(source='course.level', read_only=True)
    verification_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_id', 'user_name', 'user_email',
            'course_title', 'course_level', 'issued_at',
            'download_count', 'verification_code', 'is_active'
        ]
    
    def get_user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email
    
    def get_verification_code(self, obj):
        return obj.get_verification_code()

class CertificateDetailSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    course = CourseSerializer(read_only=True)
    verification_code = serializers.SerializerMethodField()
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'certificate_id', 'user', 'course',
            'issued_at', 'download_count', 'verification_code', 'is_active'
        ]
    
    def get_user(self, obj):
        return {
            'full_name': obj.user.get_full_name(),
            'email': obj.user.email,
            'experience_level': obj.user.experience_level
        }
    
    def get_verification_code(self, obj):
        return obj.get_verification_code()

class CertificateVerifySerializer(serializers.Serializer):
    certificate_id = serializers.CharField(required=True)
    verification_code = serializers.CharField(required=True)