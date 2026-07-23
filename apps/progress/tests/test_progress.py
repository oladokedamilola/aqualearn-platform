import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .factories import CourseEnrollmentFactory, UserProgressFactory
from apps.courses.tests.factories import CourseFactory, LessonFactory, QuizQuestionFactory
from apps.users.tests.factories import UserFactory

@pytest.mark.django_db
class TestProgressTracking:
    
    def setup_method(self):
        self.client = APIClient()
        self.user = UserFactory()
        self.client.force_authenticate(user=self.user)
    
    def test_course_enrollment(self):
        """Test enrolling in a course"""
        course = CourseFactory()
        
        url = reverse('enroll', kwargs={'course_id': course.id})
        response = self.client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'enrolled'
    
    def test_course_enrollment_duplicate(self):
        """Test duplicate course enrollment"""
        course = CourseFactory()
        CourseEnrollmentFactory(user=self.user, course=course)
        
        url = reverse('enroll', kwargs={'course_id': course.id})
        response = self.client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['status'] == 'already_enrolled'
    
    def test_update_watch_progress(self):
        """Test updating watch progress"""
        lesson = LessonFactory()
        
        url = reverse('update_watch', kwargs={'lesson_id': lesson.id})
        data = {'percentage': 45.0}
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['watch_percentage'] == 45.0
        assert response.data['watch_threshold_met'] == False
    
    def test_update_watch_progress_threshold(self):
        """Test watch progress crossing 80% threshold"""
        lesson = LessonFactory()
        
        url = reverse('update_watch', kwargs={'lesson_id': lesson.id})
        data = {'percentage': 85.0}
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['watch_percentage'] == 85.0
        assert response.data['watch_threshold_met'] == True
        assert response.data['is_eligible_for_quiz'] == True
    
    def test_update_watch_progress_invalid(self):
        """Test invalid watch progress update"""
        lesson = LessonFactory()
        
        url = reverse('update_watch', kwargs={'lesson_id': lesson.id})
        data = {'percentage': 150}  # Invalid > 100
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_submit_quiz_without_watching(self):
        """Test submitting quiz without meeting watch threshold"""
        lesson = LessonFactory()
        QuizQuestionFactory.create_batch(3, lesson=lesson)
        
        url = reverse('submit_quiz', kwargs={'lesson_id': lesson.id})
        data = {'answers': {1: 1, 2: 2, 3: 3}}
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert 'error' in response.data
    
    def test_submit_quiz_passing(self):
        """Test submitting quiz with passing score"""
        lesson = LessonFactory()
        # Create progress with watch threshold met
        progress = UserProgressFactory(
            user=self.user,
            lesson=lesson,
            watch_percentage=80,
            watch_threshold_met=True
        )
        
        # Create quiz questions
        for i in range(3):
            QuizQuestionFactory(lesson=lesson, correct_option=1)
        
        url = reverse('submit_quiz', kwargs={'lesson_id': lesson.id})
        data = {'answers': {1: 1, 2: 1, 3: 1}}  # All correct
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['passed'] == True
        assert response.data['score'] == 100
        assert response.data['lesson_completed'] == True
    
    def test_submit_quiz_failing(self):
        """Test submitting quiz with failing score"""
        lesson = LessonFactory()
        progress = UserProgressFactory(
            user=self.user,
            lesson=lesson,
            watch_percentage=80,
            watch_threshold_met=True
        )
        
        # Create quiz questions
        for i in range(3):
            QuizQuestionFactory(lesson=lesson, correct_option=1)
        
        url = reverse('submit_quiz', kwargs={'lesson_id': lesson.id})
        data = {'answers': {1: 2, 2: 2, 3: 2}}  # All wrong
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['passed'] == False
        assert response.data['score'] == 0
        assert response.data['can_retry'] == True
    
    def test_quiz_retry_limit(self):
        """Test quiz retry limit"""
        lesson = LessonFactory()
        progress = UserProgressFactory(
            user=self.user,
            lesson=lesson,
            watch_percentage=80,
            watch_threshold_met=True
        )
        
        # Create quiz questions
        for i in range(2):
            QuizQuestionFactory(lesson=lesson, correct_option=1)
        
        url = reverse('submit_quiz', kwargs={'lesson_id': lesson.id})
        
        # First attempt - fail
        data = {'answers': {1: 2, 2: 2}}
        response = self.client.post(url, data, format='json')
        assert response.data['passed'] == False
        
        # Second attempt - retry
        data = {'answers': {1: 1, 2: 1}}
        response = self.client.post(url, data, format='json')
        assert response.status_code == status.HTTP_200_OK
        
        # Third attempt - should be blocked
        data = {'answers': {1: 1, 2: 1}}
        response = self.client.post(url, data, format='json')
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert 'error' in response.data
    
    def test_lesson_status_navigation(self):
        """Test lesson navigation status"""
        course = CourseFactory()
        lessons = LessonFactory.create_batch(3, course=course)
        
        # Complete first lesson
        progress = UserProgressFactory(
            user=self.user,
            lesson=lessons[0],
            watch_percentage=80,
            watch_threshold_met=True,
            completed=True
        )
        
        url = reverse('lesson_status', kwargs={'lesson_id': lessons[1].id})
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['current_lesson']['id'] == lessons[1].id
        assert response.data['previous_lesson']['id'] == lessons[0].id
        assert response.data['next_lesson']['id'] == lessons[2].id
        assert response.data['is_next_unlocked'] == False  # Current lesson not completed
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        # Create courses and enrollments
        course1 = CourseFactory()
        course2 = CourseFactory()
        
        CourseEnrollmentFactory(user=self.user, course=course1)
        CourseEnrollmentFactory(user=self.user, course=course2)
        
        # Create lessons and progress
        lesson1 = LessonFactory(course=course1)
        lesson2 = LessonFactory(course=course1)
        
        UserProgressFactory(user=self.user, lesson=lesson1, completed=True)
        UserProgressFactory(user=self.user, lesson=lesson2, completed=False)
        
        url = reverse('dashboard')
        response = self.client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['stats']['total_courses'] == 2
        assert response.data['stats']['completed_courses'] == 0
        assert response.data['stats']['total_lessons'] == 2
        assert response.data['stats']['completed_lessons'] == 1
        assert response.data['stats']['overall_progress'] == 50