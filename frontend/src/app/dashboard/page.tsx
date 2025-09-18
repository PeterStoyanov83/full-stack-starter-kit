'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { AuthAPI, DashboardResponse } from '@/lib/auth';
import {
  Clock,
  User,
  Mail,
  Shield,
  Tag,
  Check,
  X,
  Link as LinkIcon,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      if (!token) return;

      try {
        setLoading(true);
        const data = await AuthAPI.getDashboard(token);
        setDashboardData(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Грешка при зареждане на данни');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, token, router]);

  if (!isAuthenticated || !user) {
    return (
      <Layout>
        <div className="text-center">
          <p>Пренасочване към страницата за вход...</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="relative inline-block">
            {/* Main loading ring */}
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-blue-200 to-purple-200 border-t-blue-600 mx-auto mb-8 shadow-lg"></div>
            {/* Secondary ring */}
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-purple-100 border-t-purple-500 mx-auto animate-ping opacity-30"></div>
            {/* Inner glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
          </div>
          <div className="space-y-3">
            <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Зареждане на данни...
            </p>
            <p className="text-gray-500 text-lg">Моля, изчакайте...</p>
            <div className="flex justify-center space-x-1 mt-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
          <h3 className="font-medium">Грешка</h3>
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-3 animate-slideUp">
        {/* Welcome greeting from Laravel backend */}
        {dashboardData && (
          <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-lg p-2 sm:p-3 text-white shadow-md transition-all duration-300 relative overflow-hidden">
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-sm sm:text-base font-bold mb-1 drop-shadow-xl">
                  {dashboardData.greeting}
                </h1>
                <div className="flex items-center text-blue-100 text-xs">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-2">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Текущо време: {dashboardData.current_time}</span>
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User information */}
        <div className="bg-white/80 backdrop-blur-md shadow-md rounded-lg border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-900 flex items-center">
              <User className="w-6 h-6 mr-2 text-blue-500" />
              Информация за потребителя
            </h2>
          </div>
          <div className="p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="group p-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 transition-all duration-300">
                <label className="block text-xs font-semibold text-blue-600 mb-1 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Име
                </label>
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{user.name}</p>
              </div>
              <div className="group p-2 rounded-lg bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300">
                <label className="block text-xs font-semibold text-green-600 mb-1 flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  Имейл
                </label>
                <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition-colors">{user.email}</p>
              </div>
              <div className="group p-2 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 transition-all duration-300">
                <label className="block text-xs font-semibold text-purple-600 mb-1 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Роля
                </label>
                <p className="text-sm font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {dashboardData?.user.role_display || user.role}
                </p>
              </div>
              <div className="group p-2 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300">
                <label className="block text-xs font-semibold text-orange-600 mb-1 flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  ID на потребител
                </label>
                <p className="text-sm font-bold text-gray-900 group-hover:text-orange-700 transition-colors">#{user.id}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Role-specific permissions */}
        {dashboardData?.permissions && Object.keys(dashboardData.permissions).length > 0 && (
          <div className="bg-white/80 backdrop-blur-md shadow-md rounded-lg border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
              <h2 className="text-sm font-bold text-gray-900 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-purple-500" />
                Права на достъп
              </h2>
            </div>
            <div className="p-3">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(dashboardData.permissions).map(([permission, hasAccess], index) => (
                  <div
                    key={permission}
                    className={`group relative overflow-hidden rounded-lg p-2 transition-all duration-300 ${
                      hasAccess
                        ? 'bg-gradient-to-r from-green-50 to-green-100 border border-green-200 hover:from-green-100 hover:to-green-200'
                        : 'bg-gradient-to-r from-red-50 to-red-100 border border-red-200 hover:from-red-100 hover:to-red-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                        hasAccess ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {hasAccess ? (
                          <Check className="w-4 h-4 text-white" />
                        ) : (
                          <X className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${hasAccess ? 'text-green-800' : 'text-red-800'}`}>
                          {permission.replace(/_/g, ' ').replace('can ', '').split(' ').map(word =>
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                        <p className={`text-xs ${hasAccess ? 'text-green-600' : 'text-red-600'}`}>
                          {hasAccess ? 'Разрешено' : 'Забранено'}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data source indication */}
        <div className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-lg p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <LinkIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold drop-shadow-lg">
                  🎉 Успешно свързване с Laravel Backend
                </h3>
                <p className="text-green-100 text-xs">
                  Всички данни на тази страница се зареждат от Laravel API в реално време
                </p>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}