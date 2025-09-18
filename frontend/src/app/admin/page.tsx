'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ToolsAPI, Tool, ApprovalStats } from '@/lib/tools';
import { UsersAPI, User as APIUser, SystemStats, UserFormData } from '@/lib/users';
import {
  Settings,
  Users,
  BarChart3,
  Shield,
  Database,
  Activity,
  TrendingUp,
  UserCheck,
  UserX,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wrench,
  Crown,
  Calendar,
  Mail,
  Eye,
  Lock,
  Unlock,
  X,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FileText,
  AlertCircle
} from 'lucide-react';

// Using types from the API

export default function AdminPage() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<APIUser[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [pendingTools, setPendingTools] = useState<Tool[]>([]);
  const [approvalStats, setApprovalStats] = useState<ApprovalStats | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tools' | 'settings'>('overview');
  const [toolsSubTab, setToolsSubTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // User modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<APIUser | null>(null);
  const [userFormData, setUserFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'frontend',
    password: ''
  });
  const [userFormErrors, setUserFormErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Tool approval modal states
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingTool, setRejectingTool] = useState<Tool | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [approvalLoading, setApprovalLoading] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'owner') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (token && user?.role === 'owner') {
      loadAdminData();
    }
  }, [token, user]);

  const loadAdminData = async () => {
    if (!token) return;

    setLoading(true);
    setError('');

    try {
      // Load tools data
      const toolsResponse = await ToolsAPI.getTools(token, { per_page: 100 });
      setTools(toolsResponse.data);

      // Load pending tools
      const pendingResponse = await ToolsAPI.getPendingTools(token, { per_page: 100 });
      setPendingTools(pendingResponse.data);

      // Load approval statistics
      const approvalStatsResponse = await ToolsAPI.getApprovalStats(token);
      setApprovalStats(approvalStatsResponse);

      // Load users data from API
      const usersResponse = await UsersAPI.getUsers(token);
      setUsers(usersResponse.data);

      // Load system statistics from API
      const statsResponse = await UsersAPI.getSystemStats(token);
      setSystemStats(statsResponse);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при зареждане на данните');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      'owner': 'Собственик',
      'frontend': 'Frontend',
      'backend': 'Backend',
      'pm': 'PM',
      'qa': 'QA',
      'designer': 'Дизайнер'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role: string): string => {
    const roleColors: Record<string, string> = {
      'owner': 'bg-purple-100 text-purple-800',
      'frontend': 'bg-blue-100 text-blue-800',
      'backend': 'bg-green-100 text-green-800',
      'pm': 'bg-orange-100 text-orange-800',
      'qa': 'bg-red-100 text-red-800',
      'designer': 'bg-pink-100 text-pink-800'
    };
    return roleColors[role] || 'bg-gray-100 text-gray-800';
  };

  const handleToggleUserStatus = (userId: number) => {
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, is_active: !user.is_active } : user
    ));
  };

  const handleDeleteUser = (userId: number) => {
    if (!confirm('Сигурни ли сте, че искате да изтриете този потребител?')) return;
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      role: 'frontend',
      password: ''
    });
    setUserFormErrors({});
    setShowUserModal(true);
  };

  const openEditUserModal = (user: APIUser) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: ''
    });
    setUserFormErrors({});
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      role: 'frontend',
      password: ''
    });
    setUserFormErrors({});
  };

  const validateUserForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!userFormData.name.trim()) {
      errors.name = 'Името е задължително';
    }

    if (!userFormData.email.trim()) {
      errors.email = 'Имейлът е задължителен';
    } else if (!/\S+@\S+\.\S+/.test(userFormData.email)) {
      errors.email = 'Невалиден формат на имейл';
    }

    if (!editingUser && !userFormData.password) {
      errors.password = 'Паролата е задължителна за нов потребител';
    } else if (!editingUser && userFormData.password && userFormData.password.length < 8) {
      errors.password = 'Паролата трябва да бъде поне 8 символа';
    } else if (editingUser && userFormData.password && userFormData.password.length > 0 && userFormData.password.length < 8) {
      errors.password = 'Паролата трябва да бъде поне 8 символа';
    }

    // Check for duplicate email
    const existingUser = users.find(u =>
      u.email.toLowerCase() === userFormData.email.toLowerCase() &&
      (!editingUser || u.id !== editingUser.id)
    );
    if (existingUser) {
      errors.email = 'Потребител с този имейл вече съществува';
    }

    setUserFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveUser = async () => {
    console.log('handleSaveUser called', { userFormData, token: !!token });

    if (!validateUserForm()) {
      console.log('Form validation failed');
      return;
    }

    if (!token) {
      console.log('No token available');
      setError('Няма достъп до API');
      return;
    }

    setSaving(true);
    setError(''); // Clear any previous errors

    try {
      if (editingUser) {
        console.log('Updating user', editingUser.id);
        // Update existing user via API
        const updateData: Partial<UserFormData> = {
          name: userFormData.name,
          email: userFormData.email,
          role: userFormData.role
        };

        // Only include password if provided
        if (userFormData.password && userFormData.password.trim()) {
          updateData.password = userFormData.password;
        }

        const response = await UsersAPI.updateUser(token, editingUser.id, updateData);
        console.log('User update response:', response);

        // Update local state with the response
        setUsers(prev => prev.map(user =>
          user.id === editingUser.id ? response.user : user
        ));
      } else {
        console.log('Creating new user');
        // Create new user via API
        const response = await UsersAPI.createUser(token, userFormData);
        console.log('User creation response:', response);

        // Add new user to local state
        setUsers(prev => [...prev, response.user]);
      }

      handleCloseUserModal();
    } catch (error) {
      console.error('Error saving user:', error);
      setError(error instanceof Error ? error.message : 'Грешка при запазване на потребителя');
    } finally {
      setSaving(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                         user.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus = !statusFilter ||
                         (statusFilter === 'active' && user.is_active) ||
                         (statusFilter === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleApproveTool = async (tool: Tool) => {
    if (!token) return;

    setApprovalLoading(tool.id);
    try {
      await ToolsAPI.approveTool(token, tool.id);

      // Remove from pending tools
      setPendingTools(prev => prev.filter(t => t.id !== tool.id));

      // Reload data to get updated stats
      await loadAdminData();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при одобряване на инструмента');
    } finally {
      setApprovalLoading(null);
    }
  };

  const openRejectModal = (tool: Tool) => {
    setRejectingTool(tool);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectTool = async () => {
    if (!token || !rejectingTool || !rejectionReason.trim()) return;

    setApprovalLoading(rejectingTool.id);
    try {
      await ToolsAPI.rejectTool(token, rejectingTool.id, rejectionReason);

      // Remove from pending tools
      setPendingTools(prev => prev.filter(t => t.id !== rejectingTool.id));

      // Close modal
      setShowRejectModal(false);
      setRejectingTool(null);
      setRejectionReason('');

      // Reload data to get updated stats
      await loadAdminData();

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при отказване на инструмента');
    } finally {
      setApprovalLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Одобрен';
      case 'pending':
        return 'Чака одобрение';
      case 'rejected':
        return 'Отказан';
      default:
        return status;
    }
  };

  if (!isAuthenticated || !user || user.role !== 'owner') {
    return (
      <Layout>
        <div className="text-center py-20">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-2">Достъп отказан</h2>
          <p className="text-gray-600">Нямате права за достъп до админ панела</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Crown className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Админ панел
              </h1>
              <p className="text-gray-600">Управление на системата и потребителите</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 bg-white/80 backdrop-blur-md rounded-xl p-2 border border-white/20 shadow-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Преглед
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'users'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Users className="w-4 h-4 mr-2" />
              Потребители ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'tools'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Wrench className="w-4 h-4 mr-2" />
              Инструменти ({tools.length})
              {pendingTools.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingTools.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === 'settings'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
              }`}
            >
              <Settings className="w-4 h-4 mr-2" />
              Настройки
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && systemStats && approvalStats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Общо потребители</p>
                    <p className="text-3xl font-bold">{systemStats.total_users}</p>
                    <p className="text-blue-200 text-xs mt-1">
                      {systemStats.active_users} активни
                    </p>
                  </div>
                  <Users className="w-12 h-12 text-blue-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Общо инструменти</p>
                    <p className="text-3xl font-bold">{systemStats.total_tools}</p>
                    <p className="text-green-200 text-xs mt-1">
                      {systemStats.active_tools} активни
                    </p>
                  </div>
                  <Wrench className="w-12 h-12 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Този месец</p>
                    <p className="text-3xl font-bold">{systemStats.tools_this_month}</p>
                    <p className="text-purple-200 text-xs mt-1">нови инструменти</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Категории</p>
                    <p className="text-3xl font-bold">{systemStats.categories_count}</p>
                    <p className="text-orange-200 text-xs mt-1">
                      {systemStats.tags_count} тага
                    </p>
                  </div>
                  <Database className="w-12 h-12 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Approval Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">Чакат одобрение</p>
                    <p className="text-3xl font-bold">{approvalStats.pending_count}</p>
                    <p className="text-yellow-200 text-xs mt-1">
                      {approvalStats.pending_today} днес
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-yellow-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Одобрени</p>
                    <p className="text-3xl font-bold">{approvalStats.approved_count}</p>
                    <p className="text-green-200 text-xs mt-1">
                      {approvalStats.approved_today} днес
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">Отказани</p>
                    <p className="text-3xl font-bold">{approvalStats.rejected_count}</p>
                    <p className="text-red-200 text-xs mt-1">общо</p>
                  </div>
                  <AlertTriangle className="w-12 h-12 text-red-200" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Общо активни</p>
                    <p className="text-3xl font-bold">{approvalStats.total_count}</p>
                    <p className="text-purple-200 text-xs mt-1">инструменти</p>
                  </div>
                  <BarChart3 className="w-12 h-12 text-purple-200" />
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Activity className="w-6 h-6 mr-2 text-blue-500" />
                Последна активност
              </h3>
              <div className="space-y-4">
                {tools.slice(0, 5).map((tool) => (
                  <div key={tool.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Добавен инструмент: {tool.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          От {tool.creator?.name} • {new Date(tool.created_at || '').toLocaleDateString('bg-BG')}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(tool.creator?.role || '')}`}>
                      {getRoleDisplayName(tool.creator?.role || '')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* User Filters */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Search className="w-4 h-4 inline mr-1" />
                    Търсене
                  </label>
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Име или имейл..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Роля
                  </label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="">Всички</option>
                    <option value="owner">Собственик</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="pm">PM</option>
                    <option value="qa">QA</option>
                    <option value="designer">Дизайнер</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Activity className="w-4 h-4 inline mr-1" />
                    Статус
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                  >
                    <option value="">Всички</option>
                    <option value="active">Активни</option>
                    <option value="inactive">Неактивни</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={loadAdminData}
                    className="w-full flex items-center justify-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Обнови
                  </button>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Потребители ({filteredUsers.length})
                </h3>
                <button
                  onClick={openAddUserModal}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Добави потребител
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Потребител
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Роля
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Статус
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Инструменти
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Регистрация
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="w-3 h-3 mr-1" />
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                            {user.role === 'owner' && <Crown className="w-3 h-3 mr-1" />}
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? (
                              <>
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Активен
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Неактивен
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {user.tools_count || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(user.created_at).toLocaleDateString('bg-BG')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.is_active
                                ? 'text-red-600 hover:bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                            title={user.is_active ? 'Деактивирай' : 'Активирай'}
                          >
                            {user.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => openEditUserModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Редактиraj"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {user.role !== 'owner' && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Изтрий"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tools Tab */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            {/* Tools Sub-navigation */}
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setToolsSubTab('pending')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    toolsSubTab === 'pending'
                      ? 'bg-yellow-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-yellow-600 hover:bg-yellow-50'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Чакат одобрение ({pendingTools.length})
                </button>
                <button
                  onClick={() => setToolsSubTab('all')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    toolsSubTab === 'all'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Всички ({tools.length})
                </button>
                <button
                  onClick={() => setToolsSubTab('approved')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    toolsSubTab === 'approved'
                      ? 'bg-green-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Одобрени ({tools.filter(t => t.status === 'approved').length})
                </button>
                <button
                  onClick={() => setToolsSubTab('rejected')}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    toolsSubTab === 'rejected'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Отказани ({tools.filter(t => t.status === 'rejected').length})
                </button>
              </div>
            </div>

            {/* Pending Tools */}
            {toolsSubTab === 'pending' && (
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                    Чакащи одобрение ({pendingTools.length})
                  </h3>
                  <button
                    onClick={() => router.push('/tools/create')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добави инструмент
                  </button>
                </div>
                <div className="p-6">
                  {pendingTools.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Няма чакащи инструменти</h4>
                      <p className="text-gray-600">Всички инструменти са прегледани</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingTools.map((tool) => (
                        <div key={tool.id} className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mr-3">
                                  <Wrench className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                  <h4 className="text-lg font-medium text-gray-900">{tool.name}</h4>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>От: {tool.creator?.name}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(tool.creator?.role || '')}`}>
                                      {getRoleDisplayName(tool.creator?.role || '')}
                                    </span>
                                    <span>{new Date(tool.created_at).toLocaleDateString('bg-BG')}</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-700 mb-3">{tool.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <a
                                  href={tool.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 flex items-center"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Посети
                                </a>
                                {tool.category && (
                                  <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">
                                    {tool.category.name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 ml-4">
                              <button
                                onClick={() => handleApproveTool(tool)}
                                disabled={approvalLoading === tool.id}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                  approvalLoading === tool.id
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                }`}
                              >
                                {approvalLoading === tool.id ? (
                                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <ThumbsUp className="w-4 h-4 mr-2" />
                                )}
                                Одобри
                              </button>
                              <button
                                onClick={() => openRejectModal(tool)}
                                disabled={approvalLoading === tool.id}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                              >
                                <ThumbsDown className="w-4 h-4 mr-2" />
                                Откажи
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* All Tools */}
            {toolsSubTab === 'all' && (
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Всички инструменти ({tools.length})
                  </h3>
                  <button
                    onClick={() => router.push('/tools/create')}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Добави инструмент
                  </button>
                </div>
                <div className="space-y-3">
                  {tools.map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mr-4">
                          <Wrench className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="text-sm font-medium text-gray-900">{tool.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
                              {getStatusDisplayName(tool.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate mb-1">{tool.description}</p>
                          <div className="flex items-center space-x-4">
                            <span className="text-xs text-gray-400">
                              От: {tool.creator?.name}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(tool.creator?.role || '')}`}>
                              {getRoleDisplayName(tool.creator?.role || '')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/tools/${tool.id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Преглед"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/tools/${tool.id}/edit`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Редактиране"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approved Tools */}
            {toolsSubTab === 'approved' && (
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Одобрени инструменти ({tools.filter(t => t.status === 'approved').length})
                </h3>
                <div className="space-y-3">
                  {tools.filter(t => t.status === 'approved').map((tool) => (
                    <div key={tool.id} className="flex items-center justify-between p-4 border border-green-200 rounded-lg bg-green-50">
                      <div className="flex items-center flex-1">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mr-4">
                          <Wrench className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">{tool.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                          <div className="flex items-center mt-1 space-x-4">
                            <span className="text-xs text-gray-400">
                              От: {tool.creator?.name}
                            </span>
                            {tool.approved_at && (
                              <span className="text-xs text-green-600">
                                Одобрен: {new Date(tool.approved_at).toLocaleDateString('bg-BG')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rejected Tools */}
            {toolsSubTab === 'rejected' && (
              <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                  Отказани инструменти ({tools.filter(t => t.status === 'rejected').length})
                </h3>
                <div className="space-y-3">
                  {tools.filter(t => t.status === 'rejected').map((tool) => (
                    <div key={tool.id} className="border border-red-200 rounded-lg bg-red-50 p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1">
                          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center mr-4">
                            <Wrench className="w-5 h-5 text-red-600" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{tool.name}</h4>
                            <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                            <div className="flex items-center mt-1 space-x-4">
                              <span className="text-xs text-gray-400">
                                От: {tool.creator?.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {tool.rejection_reason && (
                        <div className="mt-3 p-3 bg-red-100 rounded-lg">
                          <div className="flex items-start">
                            <MessageSquare className="w-4 h-4 text-red-600 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-800">Причина за отказ:</p>
                              <p className="text-sm text-red-700">{tool.rejection_reason}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Системни настройки</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Система</h4>
                  <p className="text-sm text-gray-600 mb-4">Основни настройки на системата</p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Конфигурирай
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Сигурност</h4>
                  <p className="text-sm text-gray-600 mb-4">Настройки за сигурност и достъп</p>
                  <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
                    Настрой
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">База данни</h4>
                  <p className="text-sm text-gray-600 mb-4">Управление на базата данни</p>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                    Поддръжка
                  </button>
                </div>
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Резервни копия</h4>
                  <p className="text-sm text-gray-600 mb-4">Автоматични резервни копия</p>
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm">
                    Планирай
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {editingUser ? 'Редактиране на потребител' : 'Добавяне на нов потребител'}
                  </h3>
                  <button
                    onClick={handleCloseUserModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={async (e) => { e.preventDefault(); await handleSaveUser(); }} className="space-y-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Име *
                    </label>
                    <input
                      type="text"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        userFormErrors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Въведете име..."
                    />
                    {userFormErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{userFormErrors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имейл *
                    </label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                        userFormErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Въведете имейл..."
                    />
                    {userFormErrors.email && (
                      <p className="mt-1 text-sm text-red-600">{userFormErrors.email}</p>
                    )}
                  </div>

                  {/* Role Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Роля *
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="frontend">Frontend</option>
                      <option value="backend">Backend</option>
                      <option value="pm">PM</option>
                      <option value="qa">QA</option>
                      <option value="designer">Дизайнер</option>
                      {user?.role === 'owner' && <option value="owner">Собственик</option>}
                    </select>
                  </div>

                  {/* Password Field */}
                  {!editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Парола *
                      </label>
                      <input
                        type="password"
                        value={userFormData.password || ''}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          userFormErrors.password ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Въведете парола (поне 8 символа)..."
                      />
                      {userFormErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{userFormErrors.password}</p>
                      )}
                      {!userFormErrors.password && (
                        <p className="mt-1 text-xs text-gray-500">Паролата трябва да съдържа поне 8 символа</p>
                      )}
                    </div>
                  )}

                  {editingUser && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Нова парола (оставете празно за без промяна)
                      </label>
                      <input
                        type="password"
                        value={userFormData.password || ''}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Въведете нова парола (поне 8 символа)..."
                      />
                      {userFormErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{userFormErrors.password}</p>
                      )}
                      {!userFormErrors.password && (
                        <p className="mt-1 text-xs text-gray-500">Ако се попълни, паролата трябва да съдържа поне 8 символа</p>
                      )}
                    </div>
                  )}

                  {/* Modal Actions */}
                  <div className="flex items-center justify-end space-x-4 pt-4 mt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCloseUserModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Отказ
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`px-6 py-2 rounded-lg transition-all duration-300 flex items-center ${
                        saving
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Запазва...
                        </>
                      ) : editingUser ? (
                        <>
                          <Edit className="w-4 h-4 mr-2" />
                          Запази промените
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Създай потребител
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && rejectingTool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                    Отказване на инструмент
                  </h3>
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mb-4">
                  <p className="text-gray-700 mb-2">
                    Отказвате инструмента: <strong>{rejectingTool.name}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Моля, въведете причина за отказа. Тя ще бъде видима за създателя на инструмента.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Причина за отказ *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Въведете подробна причина за отказа..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {rejectionReason.length}/500 символа
                  </p>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Отказ
                  </button>
                  <button
                    onClick={handleRejectTool}
                    disabled={!rejectionReason.trim() || approvalLoading === rejectingTool.id}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-all flex items-center ${
                      !rejectionReason.trim() || approvalLoading === rejectingTool.id
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {approvalLoading === rejectingTool.id ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Отказва...
                      </>
                    ) : (
                      <>
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Откажи инструмента
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}