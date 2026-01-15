import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '../app/(auth)/login/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/login',
}));

// Mock AuthContext
jest.mock('../app/providers/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    login: jest.fn(),
    logout: jest.fn(),
    isLoading: false,
  }),
}));

describe('Frontend Component Smoke Test', () => {
  test('renders login page without crashing', () => {
    render(<LoginPage />);

    // Check for main heading text
    expect(screen.getByText('Reliability Score')).toBeInTheDocument();

    // Check for sign in text
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();

    // Check for form inputs
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

    // Check for submit button
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});
