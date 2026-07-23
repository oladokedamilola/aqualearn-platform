# apps/users/serializers.py
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'full_name',
            'experience_level', 'profile_image', 'bio', 'interests',
            'onboarding_completed', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined', 'onboarding_completed']
    
    def get_full_name(self, obj):
        return obj.get_full_name()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ['email', 'first_name', 'last_name', 'password', 'password2']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        user.onboarding_completed = False
        user.save()
        return user

class OnboardingExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['experience_level']
    
    def update(self, instance, validated_data):
        instance.experience_level = validated_data.get('experience_level', instance.experience_level)
        instance.save()
        return instance

class OnboardingInterestsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['interests']
    
    def update(self, instance, validated_data):
        instance.interests = validated_data.get('interests', instance.interests)
        instance.save()
        return instance

class OnboardingProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['profile_image', 'bio']
    
    def update(self, instance, validated_data):
        # Handle profile_image
        if 'profile_image' in validated_data:
            instance.profile_image = validated_data.get('profile_image')
        
        # Handle bio
        if 'bio' in validated_data:
            instance.bio = validated_data.get('bio')
        
        # ✅ Always mark onboarding as completed
        instance.onboarding_completed = True
        instance.save()
        return instance

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)