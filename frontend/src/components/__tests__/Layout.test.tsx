import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import Layout from '../Layout';
import { useAuth } from '@/contexts/AuthContext';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
  Bot: () => <div data-testid="bot-icon">Bot</div>,
  User: () => <div data-testid="user-icon">User</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Menu: () => <div data-testid="menu-icon">Menu</div>,
  X: () => <div data-testid="x-icon">X</div>,
  LogOut: () => <div data-testid="logout-icon">LogOut</div>,
}));

const mockPush = jest.fn();
const mockLogout = jest.fn();

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders layout with children when user is not authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
    expect(screen.getByText('Vibecode')).toBeInTheDocument();
    expect(screen.getByText('🔓 Не сте влезли в системата')).toBeInTheDocument();
  });

  it('renders navigation menu when user is authenticated', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'frontend',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Начало')).toBeInTheDocument();
    expect(screen.getByText('AI Инструменти')).toBeInTheDocument();
    expect(screen.getByText('Профил')).toBeInTheDocument();
    expect(screen.getByText('Здравей, John Doe')).toBeInTheDocument();
    expect(screen.getByText('Изход')).toBeInTheDocument();
  });

  it('shows admin panel link for owner role', () => {
    const mockOwner = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'owner',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwner,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('Админ панел')).toBeInTheDocument();
  });

  it('does not show admin panel link for non-owner roles', () => {
    const mockUser = {
      id: 1,
      name: 'Regular User',
      email: 'user@example.com',
      role: 'frontend',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.queryByText('Админ панел')).not.toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger button is clicked', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'frontend',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Initially, mobile menu should not be visible
    expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();

    // Click hamburger menu button
    const menuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuButton);

    // Mobile menu should appear
    await waitFor(() => {
      const mobileNavigation = screen.getByText('ID: 1');
      expect(mobileNavigation).toBeInTheDocument();
    });

    // Click X button to close
    const closeButton = screen.getByTestId('x-icon');
    fireEvent.click(closeButton.closest('button')!);

    // Mobile menu should disappear
    await waitFor(() => {
      expect(screen.queryByTestId('mobile-menu')).not.toBeInTheDocument();
    });
  });

  it('calls logout function when logout button is clicked', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'frontend',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const logoutButton = screen.getByRole('button', { name: /изход/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  it('displays current time when component is mounted', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'frontend',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    // Initially shows placeholder
    expect(screen.getByText('--:--:--')).toBeInTheDocument();

    // After mounting, should show actual time
    await waitFor(() => {
      const timeElement = screen.getByTestId('clock-icon').parentElement;
      expect(timeElement?.textContent).not.toBe('--:--:--');
    }, { timeout: 2000 });
  });

  it('renders footer with correct information', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('© 2025 Vibecode Full-Stack Starter Kit')).toBeInTheDocument();
    expect(screen.getByText('Laravel')).toBeInTheDocument();
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('Docker')).toBeInTheDocument();
  });

  it('shows user ID in desktop view', () => {
    const mockUser = {
      id: 123,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'frontend',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByText('(ID: 123)')).toBeInTheDocument();
  });

  it('renders navigation links with correct href attributes', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'owner',
    };

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    expect(screen.getByRole('link', { name: /начало/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /ai инструменти/i })).toHaveAttribute('href', '/tools');
    expect(screen.getByRole('link', { name: /профил/i })).toHaveAttribute('href', '/profile');
    expect(screen.getByRole('link', { name: /админ панел/i })).toHaveAttribute('href', '/admin');
  });

  it('handles logout error gracefully', async () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'frontend',
    };

    const mockFailingLogout = jest.fn().mockRejectedValue(new Error('Logout failed'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockUser,
      logout: mockFailingLogout,
    });

    render(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );

    const logoutButton = screen.getByRole('button', { name: /изход/i });
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(mockFailingLogout).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});