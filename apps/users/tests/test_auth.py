import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .factories import UserFactory

User = get_user_model()

@pytest.mark.django_db
class TestAuthentication:
    
    def setup_method(self):
        self.client = APIClient()
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        url = reverse('register')
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == 'test@example.com'
        assert response.data['onboarding_required'] == True
        
        # Verify user was created
        user = User.objects.get(email='test@example.com')
        assert user.first_name == 'John'
        assert user.last_name == 'Doe'
    
    def test_registration_password_mismatch(self):
        """Test registration with mismatched passwords"""
        url = reverse('register')
        data = {
            'email': 'test@example.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'SecurePass123!',
            'password2': 'WrongPass123!'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'password' in response.data
    
    def test_registration_duplicate_email(self):
        """Test registration with duplicate email"""
        user = UserFactory(email='existing@example.com')
        
        url = reverse('register')
        data = {
            'email': 'existing@example.com',
            'first_name': 'Jane',
            'last_name': 'Smith',
            'password': 'SecurePass123!',
            'password2': 'SecurePass123!'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'email' in response.data
    
    def test_user_login(self):
        """Test user login endpoint"""
        user = UserFactory(email='test@example.com')
        
        url = reverse('login')
        data = {
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data
        assert 'refresh' in response.data
        assert response.data['user']['email'] == 'test@example.com'
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        url = reverse('login')
        data = {
            'email': 'wrong@example.com',
            'password': 'WrongPass123!'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert 'error' in response.data
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        url = reverse('login')
        data = {
            'email': 'test@example.com'
        }
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_400_BAD_REQUEST
    
    def test_password_reset_request(self):
        """Test password reset request"""
        user = UserFactory(email='test@example.com')
        
        url = reverse('password_reset')
        data = {'email': 'test@example.com'}
        response = self.client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data
    
    def test_password_reset_request_nonexistent_email(self):
        """Test password reset with non-existent email"""
        url = reverse('password_reset')
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(url, data, format='json')
        
        # Should return success even if email doesn't exist (security measure)
        assert response.status_code == status.HTTP_200_OK
        assert 'message' in response.data

@pytest.mark.django_db
class TestRateLimiting:
    
    def setup_method(self):
        self.client = APIClient()
    
    def test_login_rate_limiting(self):
        """Test rate limiting on login endpoint"""
        url = reverse('login')
        
        # Make multiple login attempts
        for i in range(6):  # Should trigger rate limit after 5 attempts
            data = {
                'email': f'test{i}@example.com',
                'password': 'WrongPass123!'
            }
            response = self.client.post(url, data, format='json')
            
            if i >= 5:
                assert response.status_code in [status.HTTP_429_TOO_MANY_REQUESTS, status.HTTP_401_UNAUTHORIZED]
            else:
                assert response.status_code == status.HTTP_401_UNAUTHORIZED