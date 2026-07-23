import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from apps.certificates.models import Certificate
from apps.courses.tests.factories import CourseFactory, LessonFactory
from apps.progress.tests.factories import UserProgressFactory
from apps.users.tests.factories import UserFactory

@pytest.mark.django_db
class TestCertificateSystem:
    
    def setup_method(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)
    
    def test_certificate_eligibility(self):
        """Test checking certificate eligibility"""
        course = CourseFactory()
        lessons = LessonFactory.create_batch(3, course=course)
        
        # Complete all lessons
        for lesson in lessons:
            UserProgressFactory(
                user=self.user,
                lesson=lesson,
                completed=True
            )
        
        url = reverse('certificate_eligibility', kwargs={'course_id': course.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_eligible'] == True
        assert response.data['completed_lessons'] == 3
        assert response.data['total_lessons'] == 3
        assert response.data['progress_percentage'] == 100
    
    def test_certificate_eligibility_incomplete(self):
        """Test eligibility for incomplete course"""
        course = CourseFactory()
        lessons = LessonFactory.create_batch(3, course=course)
        
        # Complete only 1 of 3 lessons
        UserProgressFactory(
            user=self.user,
            lesson=lessons[0],
            completed=True
        )
        
        url = reverse('certificate_eligibility', kwargs={'course_id': course.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['is_eligible'] == False
        assert response.data['completed_lessons'] == 1
        assert response.data['total_lessons'] == 3
    
    def test_issue_certificate(self):
        """Test issuing a certificate"""
        course = CourseFactory()
        lessons = LessonFactory.create_batch(2, course=course)
        
        # Complete all lessons
        for lesson in lessons:
            UserProgressFactory(
                user=self.user,
                lesson=lesson,
                completed=True
            )
        
        url = reverse('certificate_issue', kwargs={'course_id': course.id})
        response = self.client.post(url)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['status'] == 'success'
        assert 'certificate' in response.data
        
        # Verify certificate was created
        certificate = Certificate.objects.get(user=self.user, course=course)
        assert certificate.certificate_id.startswith('AQL-')
    
    def test_issue_certificate_duplicate(self):
        """Test issuing duplicate certificate"""
        course = CourseFactory()
        lessons = LessonFactory.create_batch(2, course=course)
        
        # Complete all lessons
        for lesson in lessons:
            UserProgressFactory(
                user=self.user,
                lesson=lesson,
                completed=True
            )
        
        # Issue first certificate
        Certificate.objects.create(user=self.user, course=course)
        
        url = reverse('certificate_issue', kwargs={'course_id': course.id})
        response = self.client.post(url)
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'error' in response.data
    
    def test_certificate_list(self):
        """Test listing user certificates"""
        course1 = CourseFactory()
        course2 = CourseFactory()
        
        Certificate.objects.create(user=self.user, course=course1)
        Certificate.objects.create(user=self.user, course=course2)
        
        url = reverse('certificate_list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 2
    
    def test_certificate_verification(self):
        """Test certificate verification"""
        course = CourseFactory()
        certificate = Certificate.objects.create(user=self.user, course=course)
        verification_code = certificate.get_verification_code()
        
        url = reverse('certificate_verify')
        data = {
            'certificate_id': certificate.certificate_id,
            'verification_code': verification_code
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['valid'] == True
        assert response.data['certificate']['certificate_id'] == certificate.certificate_id
    
    def test_certificate_verification_invalid(self):
        """Test certificate verification with invalid code"""
        course = CourseFactory()
        certificate = Certificate.objects.create(user=self.user, course=course)
        
        url = reverse('certificate_verify')
        data = {
            'certificate_id': certificate.certificate_id,
            'verification_code': 'invalid_code'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.data['valid'] == False
    
    def test_certificate_download_increment_count(self):
        """Test certificate download increments count"""
        course = CourseFactory()
        certificate = Certificate.objects.create(user=self.user, course=course)
        
        assert certificate.download_count == 0
        
        url = reverse('certificate_download', kwargs={'id': certificate.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response['Content-Type'] == 'application/pdf'
        
        # Check download count increased
        certificate.refresh_from_db()
        assert certificate.download_count == 1