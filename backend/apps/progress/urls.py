from django.urls import path
from .views import (
    CourseEnrollView,
    CourseProgressView,
    UpdateWatchProgressView,
    SubmitQuizView,
    LessonStatusView,
    DashboardStatsView,
    ResetWatchProgressView
)

urlpatterns = [
    path('enroll/<int:course_id>/', CourseEnrollView.as_view(), name='enroll'),
    path('course/<int:course_id>/', CourseProgressView.as_view(), name='course_progress'),
    path('watch/<int:lesson_id>/', UpdateWatchProgressView.as_view(), name='update_watch'),
    path('quiz/<int:lesson_id>/', SubmitQuizView.as_view(), name='submit_quiz'),
    path('reset/<int:lesson_id>/', ResetWatchProgressView.as_view(), name='reset_progress'),
    path('lesson/<int:lesson_id>/status/', LessonStatusView.as_view(), name='lesson_status'),
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard'),
]