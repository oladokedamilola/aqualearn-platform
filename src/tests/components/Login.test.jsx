import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import Login from '../../pages/Login'
import { vi } from 'vitest'

vi.mock('../../services/auth', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      user: { id: 1, email: 'test@example.com', first_name: 'Test' },
      access: 'mock-token',
      refresh: 'mock-refresh-token',
      onboarding_required: false
    })
  }
}))

describe('Login Component', () => {
  test('renders login form', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )
    
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })
  
  test('shows error on empty submission', async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    // Should show validation messages
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInvalid()
    })
  })
  
  test('navigates to registration page', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    )
    
    const registerLink = screen.getByText(/create one/i)
    expect(registerLink).toHaveAttribute('href', '/register')
  })
})