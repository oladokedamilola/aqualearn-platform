from django.urls import path
from .views import (
    CourseListView, CourseDetailView, LessonDetailView,
    CourseCreateView, CourseUpdateView, CourseDeleteView,
    LessonCreateView, LessonUpdateView, LessonDeleteView,
    QuizQuestionCreateView, QuizQuestionUpdateView, QuizQuestionDeleteView,
    CourseEnrollView  
)

urlpatterns = [
    # ===== PUBLIC ENDPOINTS =====
    path('', CourseListView.as_view(), name='course_list'),
    path('<int:id>/', CourseDetailView.as_view(), name='course_detail'),
    path('lessons/<int:id>/', LessonDetailView.as_view(), name='lesson_detail'),
    
    # ===== ENROLLMENT =====
    path('<int:course_id>/enroll/', CourseEnrollView.as_view(), name='course_enroll'),  # ✅ Add this
    
    # ===== ADMIN ENDPOINTS =====
    path('admin/create/', CourseCreateView.as_view(), name='course_create'),
    path('admin/<int:id>/update/', CourseUpdateView.as_view(), name='course_update'),
    path('admin/<int:id>/delete/', CourseDeleteView.as_view(), name='course_delete'),
    
    path('admin/lessons/create/', LessonCreateView.as_view(), name='lesson_create'),
    path('admin/lessons/<int:id>/update/', LessonUpdateView.as_view(), name='lesson_update'),
    path('admin/lessons/<int:id>/delete/', LessonDeleteView.as_view(), name='lesson_delete'),
    
    path('admin/quiz/create/', QuizQuestionCreateView.as_view(), name='quiz_create'),
    path('admin/quiz/<int:id>/update/', QuizQuestionUpdateView.as_view(), name='quiz_update'),
    path('admin/quiz/<int:id>/delete/', QuizQuestionDeleteView.as_view(), name='quiz_delete'),
]