# apps/certificates/models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from apps.courses.models import Course
import uuid
import hashlib

class Certificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='certificates')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='certificates')
    certificate_id = models.CharField(max_length=50, unique=True, db_index=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    download_count = models.PositiveIntegerField(default=0)
    verification_url = models.URLField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['user', 'course']
        ordering = ['-issued_at']
    
    def __str__(self):
        return f"{self.certificate_id} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        if not self.certificate_id:
            self.certificate_id = self.generate_certificate_id()
        super().save(*args, **kwargs)
    
    def generate_certificate_id(self):
        """Generate unique certificate ID: AQL-2025-0001"""
        year = timezone.now().year
        prefix = "AQL"
        
        # Get count of certificates issued this year
        count = Certificate.objects.filter(
            issued_at__year=year
        ).count() + 1
        
        return f"{prefix}-{year}-{str(count).zfill(4)}"
    
    def increment_download(self):
        """Increment download count"""
        self.download_count += 1
        self.save()
    
    def get_verification_code(self):
        """Generate a verification code for the certificate"""
        data = f"{self.certificate_id}-{self.user.email}-{self.issued_at}"
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    @classmethod
    def is_eligible(cls, user, course):
        """Check if user is eligible for a certificate"""
        from apps.progress.models import UserProgress
        
        # Get all lessons for the course
        lessons = course.lessons.all()
        if not lessons.exists():
            return False
        
        # Check if all lessons are completed
        completed_lessons = UserProgress.objects.filter(
            user=user,
            lesson__course=course,
            completed=True
        ).count()
        
        return completed_lessons >= lessons.count()
    
    @classmethod
    def issue_certificate(cls, user, course):
        """Issue a certificate if eligible"""
        if not cls.is_eligible(user, course):
            return None, "Not eligible for certificate"
        
        # Check if certificate already exists
        existing = cls.objects.filter(user=user, course=course).first()
        if existing:
            return existing, "Certificate already exists"
        
        certificate = cls.objects.create(user=user, course=course)
        return certificate, "Certificate issued successfully"