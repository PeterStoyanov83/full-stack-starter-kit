import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import AdminPage from '../page';
import { useAuth } from '@/contexts/AuthContext';
import { UsersAPI } from '@/lib/users';
import { ToolsAPI } from '@/lib/tools';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock Layout component
jest.mock('@/components/Layout', () => {
  return function Layout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock APIs
jest.mock('@/lib/users', () => ({
  UsersAPI: {
    getUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    getSystemStats: jest.fn(),
  },
}));

jest.mock('@/lib/tools', () => ({
  ToolsAPI: {
    getTools: jest.fn(),
  },
}));

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  Crown: () => <div data-testid="crown-icon">Crown</div>,
  BarChart3: () => <div data-testid="barchart-icon">BarChart</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Wrench: () => <div data-testid="wrench-icon">Wrench</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Plus: () => <div data-testid="plus-icon">Plus</div>,
  Edit: () => <div data-testid="edit-icon">Edit</div>,
  Trash2: () => <div data-testid="trash-icon">Trash</div>,
  Search: () => <div data-testid="search-icon">Search</div>,
  Shield: () => <div data-testid="shield-icon">Shield</div>,
  Activity: () => <div data-testid="activity-icon">Activity</div>,
  RefreshCw: () => <div data-testid="refresh-icon">Refresh</div>,
  AlertTriangle: () => <div data-testid="alert-icon">Alert</div>,
  CheckCircle: () => <div data-testid="check-icon">Check</div>,
  Clock: () => <div data-testid="clock-icon">Clock</div>,
  Calendar: () => <div data-testid="calendar-icon">Calendar</div>,
  Mail: () => <div data-testid="mail-icon">Mail</div>,
  Lock: () => <div data-testid="lock-icon">Lock</div>,
  Unlock: () => <div data-testid="unlock-icon">Unlock</div>,
  X: () => <div data-testid="x-icon">X</div>,
  TrendingUp: () => <div data-testid="trending-icon">Trending</div>,
  Database: () => <div data-testid="database-icon">Database</div>,
}));

const mockPush = jest.fn();

describe('AdminPage Component', () => {
  const mockOwnerUser = {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'owner',
  };

  const mockFrontendUser = {
    id: 2,
    name: 'Frontend User',
    email: 'frontend@example.com',
    role: 'frontend',
  };

  const mockUsers = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'owner',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      email_verified_at: '2025-01-01T00:00:00Z',
      tools_count: 5,
    },
    {
      id: 2,
      name: 'Frontend User',
      email: 'frontend@example.com',
      role: 'frontend',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      email_verified_at: '2025-01-01T00:00:00Z',
      tools_count: 3,
    },
  ];

  const mockStats = {
    total_users: 2,
    active_users: 2,
    total_tools: 8,
    active_tools: 7,
    tools_this_month: 3,
    categories_count: 5,
    tags_count: 12,
  };

  const mockTools = {
    data: [
      {
        id: 1,
        name: 'Test Tool',
        description: 'A test tool',
        created_at: '2025-01-01T00:00:00Z',
        creator: { name: 'Test Creator', role: 'frontend' },
        is_active: true,
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (UsersAPI.getUsers as jest.Mock).mockResolvedValue({ data: mockUsers, total: 2 });
    (UsersAPI.getSystemStats as jest.Mock).mockResolvedValue(mockStats);
    (ToolsAPI.getTools as jest.Mock).mockResolvedValue(mockTools);
  });

  it('redirects non-authenticated users to login', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
    });

    render(<AdminPage />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('redirects non-owner users to dashboard', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockFrontendUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('shows access denied message for non-owner users', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockFrontendUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    expect(screen.getByText('Достъп отказан')).toBeInTheDocument();
    expect(screen.getByText('Нямате права за достъп до админ панела')).toBeInTheDocument();
  });

  it('renders admin panel for owner users', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Админ панел')).toBeInTheDocument();
      expect(screen.getByText('Управление на системата и потребителите')).toBeInTheDocument();
    });
  });

  it('displays system statistics correctly', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument(); // total users
      expect(screen.getByText('8')).toBeInTheDocument(); // total tools
      expect(screen.getByText('3')).toBeInTheDocument(); // tools this month
      expect(screen.getByText('5')).toBeInTheDocument(); // categories count
    });
  });

  it('switches between tabs correctly', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText('Админ панел')).toBeInTheDocument();
    });

    // Click on Users tab
    const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
    fireEvent.click(usersTab);

    expect(screen.getByText('Добави потребител')).toBeInTheDocument();

    // Click on Tools tab
    const toolsTab = screen.getByRole('button', { name: /инструменти \(1\)/i });
    fireEvent.click(toolsTab);

    expect(screen.getByText('Управление на инструменти (1)')).toBeInTheDocument();
  });

  it('displays users list correctly', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    // Switch to users tab
    await waitFor(() => {
      const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
      fireEvent.click(usersTab);
    });

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
      expect(screen.getByText('Frontend User')).toBeInTheDocument();
      expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      expect(screen.getByText('frontend@example.com')).toBeInTheDocument();
    });
  });

  it('opens add user modal when Add User button is clicked', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    // Switch to users tab
    await waitFor(() => {
      const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
      fireEvent.click(usersTab);
    });

    // Click Add User button
    const addButton = screen.getByRole('button', { name: /добави потребител/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Добавяне на нов потребител')).toBeInTheDocument();
    });
  });

  it('validates user form correctly', async () => {
    const user = userEvent.setup();

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    // Switch to users tab and open modal
    await waitFor(() => {
      const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
      fireEvent.click(usersTab);
    });

    const addButton = screen.getByRole('button', { name: /добави потребител/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Добавяне на нов потребител')).toBeInTheDocument();
    });

    // Try to submit empty form
    const submitButton = screen.getByRole('button', { name: /създай потребител/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Името е задължително')).toBeInTheDocument();
      expect(screen.getByText('Имейлът е задължителен')).toBeInTheDocument();
      expect(screen.getByText('Паролата е задължителна за нов потребител')).toBeInTheDocument();
    });
  });

  it('creates user successfully', async () => {
    const user = userEvent.setup();

    const newUser = {
      id: 3,
      name: 'New User',
      email: 'newuser@example.com',
      role: 'backend',
      is_active: true,
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      email_verified_at: '2025-01-01T00:00:00Z',
      tools_count: 0,
    };

    (UsersAPI.createUser as jest.Mock).mockResolvedValue({
      message: 'User created successfully',
      user: newUser,
    });

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    // Navigate to users tab and open modal
    await waitFor(() => {
      const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
      fireEvent.click(usersTab);
    });

    const addButton = screen.getByRole('button', { name: /добави потребител/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Добавяне на нов потребител')).toBeInTheDocument();
    });

    // Fill form
    const nameInput = screen.getByPlaceholderText('Въведете име...');
    const emailInput = screen.getByPlaceholderText('Въведете имейл...');
    const passwordInput = screen.getByPlaceholderText('Въведете парола (поне 8 символа)...');

    await user.type(nameInput, 'New User');
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /създай потребител/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(UsersAPI.createUser).toHaveBeenCalledWith('fake-token', {
        name: 'New User',
        email: 'newuser@example.com',
        role: 'frontend',
        password: 'password123',
      });
    });
  });

  it('filters users by search term', async () => {
    const user = userEvent.setup();

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    // Switch to users tab
    await waitFor(() => {
      const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
      fireEvent.click(usersTab);
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText('Име или имейл...');
    await user.type(searchInput, 'Frontend');

    await waitFor(() => {
      expect(screen.getByText('Frontend User')).toBeInTheDocument();
      expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
    });
  });

  it('closes modal when X button is clicked', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    // Switch to users tab and open modal
    await waitFor(() => {
      const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
      fireEvent.click(usersTab);
    });

    const addButton = screen.getByRole('button', { name: /добави потребител/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Добавяне на нов потребител')).toBeInTheDocument();
    });

    // Click close button
    const closeButton = screen.getByTestId('x-icon');
    fireEvent.click(closeButton.closest('button')!);

    await waitFor(() => {
      expect(screen.queryByText('Добавяне на нов потребител')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (UsersAPI.getUsers as jest.Mock).mockRejectedValue(new Error('API Error'));
    (UsersAPI.getSystemStats as jest.Mock).mockRejectedValue(new Error('Stats Error'));
    (ToolsAPI.getTools as jest.Mock).mockRejectedValue(new Error('Tools Error'));

    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByText(/грешка при зареждане на данните/i)).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      user: mockOwnerUser,
      token: 'fake-token',
    });

    render(<AdminPage />);

    // Switch to users tab
    await waitFor(() => {
      const usersTab = screen.getByRole('button', { name: /потребители \(2\)/i });
      fireEvent.click(usersTab);
    });

    // Click refresh button
    const refreshButton = screen.getByRole('button', { name: /обнови/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(UsersAPI.getUsers).toHaveBeenCalledTimes(2); // Initial load + refresh
      expect(UsersAPI.getSystemStats).toHaveBeenCalledTimes(2);
      expect(ToolsAPI.getTools).toHaveBeenCalledTimes(2);
    });
  });
});