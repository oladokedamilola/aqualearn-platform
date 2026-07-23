import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from .factories import CourseFactory, LessonFactory, QuizQuestionFactory
from apps.users.tests.factories import UserFactory, AdminUserFactory

@pytest.mark.django_db
class TestCourseEndpoints:
    
    def setup_method(self):
        self.client = APIClient()
        self.admin_user = AdminUserFactory()
        self.regular_user = UserFactory()
    
    def test_course_list_public(self):
        """Test public course listing"""
        courses = CourseFactory.create_batch(3)
        
        url = reverse('course_list')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 3
        assert response.data[0]['title'] == courses[0].title
    
    def test_course_list_filter_by_level(self):
        """Test filtering courses by level"""
        CourseFactory(level='beginner')
        CourseFactory(level='intermediate')
        CourseFactory(level='advanced')
        
        url = reverse('course_list')
        response = self.client.get(url, {'level': 'beginner'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]['level'] == 'beginner'
    
    def test_course_list_search(self):
        """Test searching courses"""
        CourseFactory(title='Fish Farming Basics')
        CourseFactory(title='Catfish Farming Essentials')
        
        url = reverse('course_list')
        response = self.client.get(url, {'search': 'Catfish'})
        
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert 'Catfish' in response.data[0]['title']
    
    def test_course_detail_with_lessons(self):
        """Test course detail with lessons"""
        course = CourseFactory()
        lessons = LessonFactory.create_batch(3, course=course)
        
        url = reverse('course_detail', kwargs={'id': course.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == course.id
        assert response.data['title'] == course.title
        assert len(response.data['lessons']) == 3
        assert response.data['lesson_count'] == 3
    
    def test_course_detail_not_found(self):
        """Test course detail for non-existent course"""
        url = reverse('course_detail', kwargs={'id': 999})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_404_NOT_FOUND
    
    def test_lesson_detail_with_quiz(self):
        """Test lesson detail with quiz questions"""
        lesson = LessonFactory()
        quiz_questions = QuizQuestionFactory.create_batch(3, lesson=lesson)
        
        url = reverse('lesson_detail', kwargs={'id': lesson.id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == lesson.id
        assert response.data['title'] == lesson.title
        assert len(response.data['quiz_questions']) == 3
        assert response.data['quiz_count'] == 3
    
    def test_course_admin_create(self):
        """Test admin course creation"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('course_create')
        data = {
            'title': 'New Course',
            'description': 'Course description',
            'level': 'beginner'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'New Course'
    
    def test_course_admin_create_unauthorized(self):
        """Test course creation by non-admin user"""
        self.client.force_authenticate(user=self.regular_user)
        
        url = reverse('course_create')
        data = {
            'title': 'New Course',
            'description': 'Course description',
            'level': 'beginner'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
    
    def test_course_update_admin(self):
        """Test admin course update"""
        self.client.force_authenticate(user=self.admin_user)
        course = CourseFactory(title='Original Title')
        
        url = reverse('course_update', kwargs={'id': course.id})
        data = {'title': 'Updated Title'}
        response = self.client.patch(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'