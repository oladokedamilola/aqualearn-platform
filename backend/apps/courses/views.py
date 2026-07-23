from rest_framework import generics, permissions, filters, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404  
from django_filters.rest_framework import DjangoFilterBackend
from .models import Course, Lesson, QuizQuestion
from .serializers import (
    CourseSerializer, CourseDetailSerializer, 
    LessonSerializer, LessonDetailSerializer,
    QuizQuestionSerializer
)

# ============================================================================
# PUBLIC VIEWS (AllowAny)
# ============================================================================

class CourseListView(generics.ListAPIView):
    """
    List all courses with filtering and search - PUBLIC
    
    Query Parameters:
        - level: beginner, intermediate, advanced
        - search: Search in title and description
    """
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['level']
    search_fields = ['title', 'description']

class CourseDetailView(generics.RetrieveAPIView):
    """
    Get course details with all lessons - PUBLIC
    """
    queryset = Course.objects.filter(is_active=True)
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class CourseEnrollView(APIView):
    """Enroll user in a course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id):
        from apps.progress.models import CourseEnrollment  # ✅ Import here or at top
        course = get_object_or_404(Course, id=course_id, is_active=True)
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=request.user,
            course=course
        )
        return Response({
            'status': 'enrolled' if created else 'already_enrolled',
            'course': course.title,
            'course_id': course.id
        }, status=status.HTTP_200_OK)


class LessonDetailView(generics.RetrieveAPIView):
    """
    Get lesson details with quiz questions - PUBLIC
    
    Note: Quiz answers (correct_option) are hidden in the response
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'

# ============================================================================
# ADMIN VIEWS (IsAdminUser)
# ============================================================================

class CourseCreateView(generics.CreateAPIView):
    """Create a new course (Admin only)"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAdminUser]

class CourseUpdateView(generics.UpdateAPIView):
    """Update a course (Admin only)"""
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

class CourseDeleteView(generics.DestroyAPIView):
    """Delete a course (Admin only)"""
    queryset = Course.objects.all()
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

class LessonCreateView(generics.CreateAPIView):
    """Create a new lesson (Admin only)"""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAdminUser]

class LessonUpdateView(generics.UpdateAPIView):
    """Update a lesson (Admin only)"""
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

class LessonDeleteView(generics.DestroyAPIView):
    """Delete a lesson (Admin only)"""
    queryset = Lesson.objects.all()
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

class QuizQuestionCreateView(generics.CreateAPIView):
    """Create a quiz question (Admin only)"""
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAdminUser]

class QuizQuestionUpdateView(generics.UpdateAPIView):
    """Update a quiz question (Admin only)"""
    queryset = QuizQuestion.objects.all()
    serializer_class = QuizQuestionSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'

class QuizQuestionDeleteView(generics.DestroyAPIView):
    """Delete a quiz question (Admin only)"""
    queryset = QuizQuestion.objects.all()
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'