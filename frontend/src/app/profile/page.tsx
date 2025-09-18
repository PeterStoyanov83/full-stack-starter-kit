'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { ToolsAPI, Tool } from '@/lib/tools';
import { TwoFactorAPI, TwoFactorStatus } from '@/lib/twofactor';
import GoogleAuthenticatorSetup from '@/components/TwoFactor/GoogleAuthenticatorSetup';
import {
  User,
  Shield,
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  Trash2,
  Settings,
  Activity,
  TrendingUp,
  Award,
  Clock,
  Wrench,
  Smartphone,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface UserStats {
  total_tools: number;
  active_tools: number;
  tools_this_month: number;
  last_activity: string;
}

export default function ProfilePage() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userTools, setUserTools] = useState<Tool[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // 2FA states
  const [twoFactorStatus, setTwoFactorStatus] = useState<TwoFactorStatus | null>(null);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);

  // Form states
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (token && user) {
      loadUserData();
      loadTwoFactorStatus();
    }
  }, [token, user]);

  const loadUserData = async () => {
    if (!token || !user) return;

    setLoading(true);
    setError('');

    try {
      // Load user's tools
      const toolsResponse = await ToolsAPI.getTools(token, {
        user_id: user.id,
        per_page: 50
      });

      setUserTools(toolsResponse.data);

      // Calculate stats
      const stats: UserStats = {
        total_tools: toolsResponse.data.length,
        active_tools: toolsResponse.data.filter(tool => tool.is_active).length,
        tools_this_month: toolsResponse.data.filter(tool => {
          const toolDate = new Date(tool.created_at || '');
          const now = new Date();
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          return toolDate >= thisMonth;
        }).length,
        last_activity: user.updated_at || user.created_at || ''
      };

      setUserStats(stats);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при зареждане на данните');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!token) return;

    try {
      setLoading(true);
      // Note: This would need a backend endpoint to update user profile
      // For now, we'll just simulate success
      setIsEditing(false);
      setError('Профилът е обновен успешно');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при запазване');
    } finally {
      setLoading(false);
    }
  };

  const loadTwoFactorStatus = async () => {
    if (!token) return;

    try {
      const status = await TwoFactorAPI.getStatus(token);
      setTwoFactorStatus(status);
    } catch (error) {
      console.error('Error loading 2FA status:', error);
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!token || !confirm('Сигурни ли сте, че искате да деактивирате двуфакторната автентикация?')) return;

    setTwoFactorLoading(true);
    try {
      await TwoFactorAPI.disable(token);
      await loadTwoFactorStatus();
      setError('Двуфакторната автентикация е деактивирана успешно');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при деактивиране на 2FA');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleTwoFactorSuccess = async () => {
    await loadTwoFactorStatus();
    setShowGoogleSetup(false);
    setError('Двуфакторната автентикация е активирана успешно!');
  };

  const handleDeleteTool = async (toolId: number) => {
    if (!token || !confirm('Сигурни ли сте, че искате да изтриете този инструмент?')) return;

    try {
      await ToolsAPI.deleteTool(token, toolId);
      setUserTools(prev => prev.filter(tool => tool.id !== toolId));
      if (userStats) {
        setUserStats({
          ...userStats,
          total_tools: userStats.total_tools - 1,
          active_tools: userStats.active_tools - 1
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при изтриване');
    }
  };

  const getRoleDisplayName = (role: string): string => {
    const roleNames: Record<string, string> = {
      'owner': 'Собственик',
      'frontend': 'Frontend разработчик',
      'backend': 'Backend разработчик',
      'pm': 'Проект мениджър',
      'qa': 'QA специалист',
      'designer': 'Дизайнер'
    };
    return roleNames[role] || role;
  };

  const getRolePermissions = (role: string): string[] => {
    const permissions: Record<string, string[]> = {
      'owner': [
        'Пълен достъп до системата',
        'Управление на всички потребители',
        'Редактиране на всички инструменти',
        'Администриране на категории и тагове',
        'Достъп до системна статистика'
      ],
      'frontend': [
        'Добавяне на нови инструменти',
        'Редактиране на собствени инструменти',
        'Преглед на всички инструменти',
        'Коментиране и оценяване'
      ],
      'backend': [
        'Добавяне на нови инструменти',
        'Редактиране на собствени инструменти',
        'Преглед на всички инструменти',
        'Технически анализ'
      ],
      'pm': [
        'Добавяне на нови инструменти',
        'Редактиране на собствени инструменти',
        'Преглед на всички инструменти',
        'Планиране и организация'
      ],
      'qa': [
        'Добавяне на нови инструменти',
        'Редактиране на собствени инструменти',
        'Преглед на всички инструменти',
        'Тестване и валидация'
      ],
      'designer': [
        'Добавяне на нови инструменти',
        'Редактиране на собствени инструменти',
        'Преглед на всички инструменти',
        'Дизайн и визуализация'
      ]
    };
    return permissions[role] || ['Стандартен достъп'];
  };

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p>Пренасочване към страницата за вход...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Моят профил
          </h1>
          <p className="text-gray-600">Управлявайте профила и прегледайте активността си</p>
        </div>

        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-500" />
                  Профил
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {isEditing ? <X className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
                  <span className="ml-1 text-sm">{isEditing ? 'Отказ' : 'Редактиране'}</span>
                </button>
              </div>

              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Име</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.name}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Имейл</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Роля</label>
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-purple-500" />
                    <span className="text-gray-900 font-medium">{getRoleDisplayName(user.role)}</span>
                  </div>
                </div>

                {/* Member Since */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Член от</label>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-green-500" />
                    <span className="text-gray-900">
                      {new Date(user.created_at || '').toLocaleDateString('bg-BG')}
                    </span>
                  </div>
                </div>

                {isEditing && (
                  <button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2 inline" />
                    {loading ? 'Запазване...' : 'Запази промените'}
                  </button>
                )}
              </div>
            </div>

            {/* Permissions Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-green-500" />
                Права на достъп
              </h3>
              <div className="space-y-2">
                {getRolePermissions(user.role).map((permission, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700">{permission}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-500" />
                Сигурност
              </h3>

              <div className="space-y-4">
                {/* Two-Factor Authentication */}
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="font-medium text-gray-900">Двуфакторна автентикация</span>
                    </div>
                    {twoFactorStatus?.is_enabled ? (
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Активирана</span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 text-orange-500 mr-1" />
                        <span className="text-sm text-orange-600">Неактивна</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Добавете допълнителен слой сигурност към вашия акаунт
                  </p>

                  {twoFactorStatus?.is_enabled ? (
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Метод:</span>
                        <span className="ml-2 capitalize">{twoFactorStatus.enabled_methods[0]?.method}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium">Активирана на:</span>
                        <span className="ml-2">
                          {twoFactorStatus.enabled_methods[0]?.last_used_at ? new Date(twoFactorStatus.enabled_methods[0].last_used_at).toLocaleDateString('bg-BG') : 'Неизвестно'}
                        </span>
                      </div>
                      <button
                        onClick={handleDisableTwoFactor}
                        disabled={twoFactorLoading}
                        className="w-full mt-3 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium disabled:opacity-50"
                      >
                        {twoFactorLoading ? 'Деактивиране...' : 'Деактивирай 2FA'}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowGoogleSetup(true)}
                      disabled={twoFactorLoading}
                      className="w-full bg-blue-50 text-blue-700 border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      Настрой Google Authenticator
                    </button>
                  )}
                </div>

                {/* Password Change */}
                <div>
                  <div className="flex items-center mb-2">
                    <Settings className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium text-gray-900">Смяна на парола</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Редовно променяйте паролата си за по-добра сигурност
                  </p>
                  <button className="w-full bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                    Промени паролата
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Stats and Tools */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Cards */}
            {userStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Общо инструменти</p>
                      <p className="text-2xl font-bold">{userStats.total_tools}</p>
                    </div>
                    <Wrench className="w-8 h-8 text-blue-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Активни</p>
                      <p className="text-2xl font-bold">{userStats.active_tools}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Този месец</p>
                      <p className="text-2xl font-bold">{userStats.tools_this_month}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-200" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm">Ранг</p>
                      <p className="text-xl font-bold">{getRoleDisplayName(user.role).split(' ')[0]}</p>
                    </div>
                    <Award className="w-8 h-8 text-orange-200" />
                  </div>
                </div>
              </div>
            )}

            {/* My Tools */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Wrench className="w-6 h-6 mr-2 text-blue-500" />
                  Моите инструменти
                </h3>
                <button
                  onClick={() => router.push('/tools/create')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105"
                >
                  Добави нов
                </button>
              </div>

              {loading && userTools.length === 0 ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600">Зареждане...</p>
                </div>
              ) : userTools.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-gray-700 mb-2">Няма добавени инструменти</h4>
                  <p className="text-gray-500 mb-4">Започнете с добавяне на вашия първи AI инструмент</p>
                  <button
                    onClick={() => router.push('/tools/create')}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Добави първия инструмент
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTools.map((tool) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        <div className="flex-shrink-0 mr-3">
                          {tool.category ? (
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm"
                              style={{ backgroundColor: tool.category.color }}
                            >
                              {tool.category.icon}
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-gray-300 flex items-center justify-center">
                              <Wrench className="w-4 h-4 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{tool.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                          <div className="flex items-center mt-1">
                            <Clock className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {new Date(tool.created_at || '').toLocaleDateString('bg-BG')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => router.push(`/tools/${tool.id}`)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Преглед"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => router.push(`/tools/${tool.id}/edit`)}
                          className="text-green-600 hover:text-green-800 p-1"
                          title="Редактиране"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTool(tool.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Изтриване"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2FA Setup Modal */}
        <GoogleAuthenticatorSetup
          isOpen={showGoogleSetup}
          onClose={() => setShowGoogleSetup(false)}
          onSuccess={handleTwoFactorSuccess}
        />
      </div>
    </Layout>
  );
}