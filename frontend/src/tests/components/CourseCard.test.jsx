import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CourseCard from '../../components/CourseCard'

const mockCourse = {
  id: 1,
  title: 'Fish Farming Basics',
  description: 'Learn the fundamentals of fish farming',
  level: 'beginner',
  lesson_count: 5,
  total_duration: 1200,
  image: null
}

describe('CourseCard Component', () => {
  test('renders course information', () => {
    render(
      <BrowserRouter>
        <CourseCard course={mockCourse} />
      </BrowserRouter>
    )
    
    expect(screen.getByText('Fish Farming Basics')).toBeInTheDocument()
    expect(screen.getByText(/Learn the fundamentals/i)).toBeInTheDocument()
    expect(screen.getByText(/5 lessons/i)).toBeInTheDocument()
    expect(screen.getByText(/🌱 Beginner/i)).toBeInTheDocument()
  })
  
  test('links to course detail page', () => {
    render(
      <BrowserRouter>
        <CourseCard course={mockCourse} />
      </BrowserRouter>
    )
    
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/courses/1')
  })
})