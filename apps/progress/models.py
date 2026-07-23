# apps/progress/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.courses.models import Course, Lesson
from django.core.mail import send_mail
from django.template.loader import render_to_string

class UserProgress(models.Model):
    """Track user progress for each lesson"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='user_progress')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='user_progress', null=True, blank=True)
    
    # Watch progress
    watch_percentage = models.FloatField(default=0.0, help_text='Percentage of video watched (0-100)')
    watch_threshold_met = models.BooleanField(default=False, help_text='Has user watched 80%?')
    last_watch_time = models.DateTimeField(auto_now=True)
    
    # Quiz progress
    quiz_attempted = models.BooleanField(default=False)
    quiz_passed = models.BooleanField(default=False)
    quiz_score = models.FloatField(null=True, blank=True, help_text='Score percentage (0-100)')
    quiz_attempts = models.PositiveIntegerField(default=0, help_text='Number of quiz attempts')
    quiz_completed_at = models.DateTimeField(null=True, blank=True)
    
    # Lesson completion
    completed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['user', 'lesson']
        ordering = ['lesson__order']
    
    def __str__(self):
        return f"{self.user.email} - {self.lesson.title}"
    
    def update_watch_progress(self, percentage):
        """Update watch percentage and check threshold"""
        self.watch_percentage = min(100, max(0, percentage))
        if percentage >= 80:
            self.watch_threshold_met = True
        self.save()
    
    def attempt_quiz(self):
        """Increment quiz attempts"""
        self.quiz_attempts += 1
        self.quiz_attempted = True
        self.save()
    
    def complete_quiz(self, score, passed):
        """Complete quiz with score"""
        self.quiz_score = score
        self.quiz_passed = passed
        self.quiz_completed_at = timezone.now()
        if passed:
            self.completed = True
            self.completed_at = timezone.now()
        self.save()
    
    def is_eligible_for_quiz(self):
        """Check if user can take the quiz"""
        return self.watch_threshold_met and not self.completed
    
    def can_retry_quiz(self):
        """Check if user can retry quiz (max 1 retry)"""
        return self.quiz_attempts < 3 and not self.quiz_passed

class CourseEnrollment(models.Model):
    """Track course enrollment and overall progress"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)
    
    class Meta:
        unique_together = ['user', 'course']
    
    def __str__(self):
        return f"{self.user.email} - {self.course.title}"
    
    def update_progress(self):
        """Update overall course progress based on lessons"""
        total_lessons = self.course.lessons.count()
        if total_lessons == 0:
            return False
        
        completed_lessons = UserProgress.objects.filter(
            user=self.user,
            lesson__course=self.course,
            completed=True
        ).count()
        
        if completed_lessons >= total_lessons:
            self.is_completed = True
            self.completed_at = timezone.now()
            self.save()
            
            # ✅ AUTO-GENERATE CERTIFICATE
            try:
                from apps.certificates.models import Certificate
                certificate, message = Certificate.issue_certificate(self.user, self.course)
                print(f"✅ Certificate issued for {self.user.email}: {message}")
            except Exception as e:
                print(f"❌ Certificate error: {e}")
            
            # Send completion notification
            self._send_completion_email()
            return True
        return False
    
    def _send_completion_email(self):
        """Send email notification on course completion"""
        try:
            subject = f'🎉 Congratulations! You completed {self.course.title}'
            message = render_to_string('progress/course_completion_email.html', {
                'user': self.user,
                'course': self.course,
                'site_name': 'AquaLearn',
                'certificate_url': f"{settings.FRONTEND_URL}/certificates"
            })
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [self.user.email],
                fail_silently=True,
            )
        except Exception as e:
            # Log error but don't fail
            print(f"Email error: {e}")
    
    @property
    def progress_percentage(self):
        """Calculate overall progress percentage"""
        total_lessons = self.course.lessons.count()
        if total_lessons == 0:
            return 0
        completed_lessons = UserProgress.objects.filter(
            user=self.user,
            lesson__course=self.course,
            completed=True
        ).count()
        return (completed_lessons / total_lessons) * 100