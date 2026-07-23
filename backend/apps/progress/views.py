from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from apps.courses.models import Course, Lesson, QuizQuestion
from .models import UserProgress, CourseEnrollment
from .serializers import (
    UserProgressSerializer, CourseEnrollmentSerializer,
    WatchProgressUpdateSerializer, QuizSubmitSerializer
)

class CourseEnrollView(APIView):
    """Enroll user in a course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, is_active=True)
        enrollment, created = CourseEnrollment.objects.get_or_create(
            user=request.user,
            course=course
        )
        return Response({
            'status': 'enrolled' if created else 'already_enrolled',
            'course': course.title
        }, status=status.HTTP_200_OK)

class CourseProgressView(APIView):
    """Get user progress for all lessons in a course"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        enrollment = CourseEnrollment.objects.filter(
            user=request.user,
            course=course
        ).first()
        
        # Get or create progress for all lessons
        progress_data = []
        for lesson in course.lessons.all():
            progress, _ = UserProgress.objects.get_or_create(
                user=request.user,
                lesson=lesson,
                course=course
            )
            progress_data.append(UserProgressSerializer(progress).data)
        
        return Response({
            'course': {
                'id': course.id,
                'title': course.title,
                'total_lessons': course.lessons.count()
            },
            'enrollment': CourseEnrollmentSerializer(enrollment).data if enrollment else None,
            'lessons': progress_data
        })

class UpdateWatchProgressView(APIView):
    """Update watch percentage for a lesson"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        serializer = WatchProgressUpdateSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        percentage = serializer.validated_data['percentage']
        progress, _ = UserProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'course': lesson.course}
        )
        
        progress.update_watch_progress(percentage)
        
        return Response({
            'status': 'success',
            'watch_percentage': progress.watch_percentage,
            'watch_threshold_met': progress.watch_threshold_met,
            'is_eligible_for_quiz': progress.is_eligible_for_quiz()
        })

class SubmitQuizView(APIView):
    """Submit quiz answers and calculate score"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        progress, _ = UserProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'course': lesson.course}
        )
        
        # Check if user is eligible
        if not progress.is_eligible_for_quiz():
            return Response({
                'error': 'You need to watch at least 80% of the video before taking the quiz.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if user has already passed
        if progress.quiz_passed:
            return Response({
                'error': 'You have already passed this quiz.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check retry limit
        if not progress.can_retry_quiz():
            return Response({
                'error': 'You have already used your quiz attempts.'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = QuizSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        answers = serializer.validated_data['answers']
        questions = lesson.quiz_questions.all()
        
        if not questions.exists():
            return Response({
                'error': 'No quiz questions available for this lesson.'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate score
        correct_count = 0
        results = []
        
        for question in questions:
            user_answer = answers.get(str(question.id))
            is_correct = user_answer == question.correct_option
            
            if is_correct:
                correct_count += 1
            
            results.append({
                'question_id': question.id,
                'question': question.question,
                'user_answer': user_answer,
                'correct_answer': question.correct_option,
                'is_correct': is_correct,
                'explanation': question.explanation,
                'options': question.get_options()
            })
        
        total_questions = questions.count()
        score_percentage = (correct_count / total_questions) * 100
        passed = score_percentage >= 70
        
        # Increment attempts and save
        progress.attempt_quiz()
        progress.complete_quiz(score_percentage, passed)
        
        # ✅ Update course enrollment progress
        enrollment, _ = CourseEnrollment.objects.get_or_create(
            user=request.user,
            course=lesson.course
        )
        
        # ✅ Check if all lessons are completed and auto-issue certificate
        course_completed = enrollment.update_progress()
        
        # ✅ If course was just completed, certificate is automatically issued
        # by the update_progress() method
        
        return Response({
            'status': 'success',
            'score': score_percentage,
            'passed': passed,
            'correct_count': correct_count,
            'total_questions': total_questions,
            'attempts_used': progress.quiz_attempts,
            'can_retry': progress.can_retry_quiz(),
            'results': results,
            'lesson_completed': progress.completed,
            'course_completed': course_completed,
            'certificate_issued': course_completed  # ✅ Indicate if certificate was issued
        })

class LessonStatusView(APIView):
    """Get status and next/previous lessons"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, lesson_id):
        current_lesson = get_object_or_404(Lesson, id=lesson_id)
        course = current_lesson.course
        
        # Get current user progress
        progress, _ = UserProgress.objects.get_or_create(
            user=request.user,
            lesson=current_lesson,
            defaults={'course': course}
        )
        
        # Get all lessons in order
        lessons = course.lessons.all()
        lesson_ids = list(lessons.values_list('id', flat=True))
        
        try:
            current_index = lesson_ids.index(current_lesson.id)
        except ValueError:
            current_index = -1
        
        # Find previous and next
        previous_lesson = None
        next_lesson = None
        
        if current_index > 0:
            prev_id = lesson_ids[current_index - 1]
            previous_lesson = Lesson.objects.get(id=prev_id)
        
        if current_index < len(lesson_ids) - 1:
            next_id = lesson_ids[current_index + 1]
            next_lesson = Lesson.objects.get(id=next_id)
        
        # Check if next lesson is unlocked (previous is completed)
        is_next_unlocked = True
        if current_index >= 0:
            # For the first lesson, always unlocked
            if current_index == 0:
                is_next_unlocked = True
            else:
                # Check if current lesson is completed
                is_next_unlocked = progress.completed
        
        return Response({
            'current_lesson': {
                'id': current_lesson.id,
                'title': current_lesson.title,
                'order': current_lesson.order,
                'completed': progress.completed
            },
            'previous_lesson': {
                'id': previous_lesson.id,
                'title': previous_lesson.title,
            } if previous_lesson else None,
            'next_lesson': {
                'id': next_lesson.id,
                'title': next_lesson.title,
            } if next_lesson else None,
            'is_next_unlocked': is_next_unlocked,
            'total_lessons': len(lesson_ids),
            'current_index': current_index + 1
        })
        
        
class ResetWatchProgressView(APIView):
    """Reset watch progress for a lesson"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        progress, _ = UserProgress.objects.get_or_create(
            user=request.user,
            lesson=lesson,
            defaults={'course': lesson.course}
        )
        
        # Reset watch progress
        progress.watch_percentage = 0
        progress.watch_threshold_met = False
        progress.quiz_attempted = False
        progress.quiz_passed = False
        progress.quiz_score = None
        progress.quiz_attempts = 0
        progress.quiz_completed_at = None
        progress.completed = False
        progress.completed_at = None
        progress.save()
        
        return Response({
            'status': 'success',
            'message': 'Watch progress has been reset.',
            'watch_percentage': 0,
            'is_eligible_for_quiz': False
        }, status=status.HTTP_200_OK)
        
        

from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import timedelta

class DashboardStatsView(APIView):
    """Get dashboard statistics for user"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get all enrollments
        enrollments = CourseEnrollment.objects.filter(user=user)
        total_courses = enrollments.count()
        completed_courses = enrollments.filter(is_completed=True).count()
        
        # Get progress for all lessons
        progress = UserProgress.objects.filter(user=user)
        completed_lessons = progress.filter(completed=True).count()
        total_lessons = Lesson.objects.filter(
            course__in=enrollments.values_list('course', flat=True)
        ).count()
        
        # Get quizzes passed
        quizzes_passed = progress.filter(quiz_passed=True).count()
        quizzes_attempted = progress.filter(quiz_attempted=True).count()
        
        # Get recent activity (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_activity = []
        
        # Recent quiz activity
        recent_quizzes = progress.filter(
            quiz_attempted=True,
            quiz_completed_at__gte=week_ago
        ).order_by('-quiz_completed_at')[:5]
        
        for p in recent_quizzes:
            recent_activity.append({
                'type': 'quiz',
                'lesson': p.lesson.title,
                'course': p.course.title,
                'score': p.quiz_score,
                'passed': p.quiz_passed,
                'completed_at': p.quiz_completed_at,
                'icon': '✅' if p.quiz_passed else '📝'
            })
        
        # Recent watch activity
        recent_watches = progress.filter(
            last_watch_time__gte=week_ago
        ).exclude(watch_percentage=0).order_by('-last_watch_time')[:5]
        
        for p in recent_watches:
            recent_activity.append({
                'type': 'watch',
                'lesson': p.lesson.title,
                'course': p.course.title,
                'percentage': p.watch_percentage,
                'last_watch': p.last_watch_time,
                'icon': '🎥'
            })
        
        # Sort by date (most recent first)
        recent_activity.sort(
            key=lambda x: x.get('completed_at') or x.get('last_watch'),
            reverse=True
        )
        recent_activity = recent_activity[:5]
        
        # Get course progress details
        course_progress = []
        next_lesson = None
        
        for enrollment in enrollments:
            course_lessons = enrollment.course.lessons.count()
            completed = UserProgress.objects.filter(
                user=user,
                lesson__course=enrollment.course,
                completed=True
            ).count()
            
            # Find next incomplete lesson for "Continue Learning"
            if not enrollment.is_completed and not next_lesson:
                next_progress = UserProgress.objects.filter(
                    user=user,
                    lesson__course=enrollment.course,
                    completed=False
                ).order_by('lesson__order').first()
                
                if next_progress:
                    next_lesson = {
                        'id': next_progress.lesson.id,
                        'title': next_progress.lesson.title,
                        'course_id': enrollment.course.id,
                        'course_title': enrollment.course.title,
                        'progress': (completed / course_lessons * 100) if course_lessons > 0 else 0
                    }
            
            course_progress.append({
                'course_id': enrollment.course.id,
                'title': enrollment.course.title,
                'level': enrollment.course.level,
                'image': enrollment.course.image.url if enrollment.course.image else None,
                'progress': (completed / course_lessons * 100) if course_lessons > 0 else 0,
                'is_completed': enrollment.is_completed,
                'total_lessons': course_lessons,
                'completed_lessons': completed,
                'lessons_remaining': course_lessons - completed
            })
        
        # Calculate estimated time remaining
        total_watch_time = progress.aggregate(
            total=Avg('lesson__video_duration')
        )['total'] or 0
        
        remaining_lessons = progress.filter(completed=False).count()
        estimated_time = remaining_lessons * (total_watch_time / 60) if total_watch_time > 0 else 0
        
        # Get earned certificates (will be implemented in Phase 5)
        # For now, we'll check completed courses
        earned_certificates = []
        for enrollment in enrollments.filter(is_completed=True):
            earned_certificates.append({
                'course_id': enrollment.course.id,
                'course_title': enrollment.course.title,
                'completed_at': enrollment.completed_at
            })
        
        return Response({
            'user': {
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
                'profile_image': user.profile_image.url if user.profile_image else None,
                'experience_level': user.experience_level,
                'joined': user.date_joined
            },
            'stats': {
                'total_courses': total_courses,
                'completed_courses': completed_courses,
                'total_lessons': total_lessons,
                'completed_lessons': completed_lessons,
                'quizzes_passed': quizzes_passed,
                'quizzes_attempted': quizzes_attempted,
                'overall_progress': (completed_lessons / total_lessons * 100) if total_lessons > 0 else 0,
                'estimated_time_remaining': estimated_time
            },
            'course_progress': course_progress,
            'next_lesson': next_lesson,
            'recent_activity': recent_activity,
            'earned_certificates': earned_certificates
        })