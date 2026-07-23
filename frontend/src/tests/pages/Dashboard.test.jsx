import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Dashboard from '../../pages/Dashboard'
import { vi } from 'vitest'

vi.mock('../../services/progress', () => ({
  progressService: {
    getDashboardStats: vi.fn().mockResolvedValue({
      user: {
        first_name: 'Test',
        last_name: 'User',
        email: 'test@example.com'
      },
      stats: {
        total_courses: 3,
        completed_courses: 1,
        total_lessons: 15,
        completed_lessons: 5,
        quizzes_passed: 4,
        quizzes_attempted: 6,
        overall_progress: 33,
        estimated_time_remaining: 45
      },
      course_progress: [
        {
          course_id: 1,
          title: 'Fish Farming Basics',
          level: 'beginner',
          progress: 60,
          is_completed: false,
          total_lessons: 5,
          completed_lessons: 3,
          lessons_remaining: 2
        }
      ],
      next_lesson: {
        id: 2,
        title: 'Pond Construction',
        course_id: 1,
        course_title: 'Fish Farming Basics',
        progress: 60
      },
      recent_activity: [
        {
          type: 'watch',
          lesson: 'Introduction to Fish Farming',
          course: 'Fish Farming Basics',
          percentage: 85,
          icon: '🎥'
        }
      ],
      earned_certificates: []
    })
  }
}))

describe('Dashboard Page', () => {
  test('displays user welcome message', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Test!/i)).toBeInTheDocument()
    })
  })
  
  test('displays course progress', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Fish Farming Basics')).toBeInTheDocument()
      expect(screen.getByText('60%')).toBeInTheDocument()
      expect(screen.getByText(/3\/5 lessons/i)).toBeInTheDocument()
    })
  })
  
  test('displays continue learning section', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </BrowserRouter>
    )
    
    await waitFor(() => {
      expect(screen.getByText('Continue Learning')).toBeInTheDocument()
      expect(screen.getByText('Pond Construction')).toBeInTheDocument()
    })
  })
})