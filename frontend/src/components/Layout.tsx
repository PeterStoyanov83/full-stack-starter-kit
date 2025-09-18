'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Clock, Home, Bot, Menu, X, LogOut, User, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemHealth, setSystemHealth] = useState<{
    status: 'healthy' | 'degraded' | 'offline';
    lastCheck: Date;
  }>({ status: 'healthy', lastCheck: new Date() });

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkSystemHealth = async () => {
    try {
      const response = await fetch('http://localhost:8201/api/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Check if all services are healthy
        const allServicesHealthy =
          data.services?.database?.status === 'connected' &&
          data.services?.cache?.status === 'active' &&
          data.services?.redis?.status === 'connected';

        setSystemHealth({
          status: allServicesHealthy ? 'healthy' : 'degraded',
          lastCheck: new Date()
        });
      } else {
        setSystemHealth({
          status: response.status >= 500 ? 'offline' : 'degraded',
          lastCheck: new Date()
        });
      }
    } catch (error) {
      setSystemHealth({
        status: 'offline',
        lastCheck: new Date()
      });
    }
  };

  // Fix hydration mismatch by only showing time after component mounts
  useEffect(() => {
    setMounted(true);

    const updateTime = () => {
      setCurrentTime(new Date().toLocaleString('bg-BG', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }));
    };

    updateTime(); // Set initial time
    const timeInterval = setInterval(updateTime, 1000); // Update every second

    // Health check
    checkSystemHealth().catch(console.error); // Initial check
    const healthInterval = setInterval(() => {
      checkSystemHealth().catch(console.error);
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(timeInterval);
      clearInterval(healthInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header with logo and navigation */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center group">
              <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                Vibecode
              </div>
              <div className={`ml-2 sm:ml-3 px-2 py-1 rounded-full cursor-pointer transition-all duration-300 ${
                systemHealth.status === 'healthy'
                  ? 'bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300'
                  : systemHealth.status === 'degraded'
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 hover:from-yellow-200 hover:to-yellow-300'
                  : 'bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300'
              }`}
              title={`System Status: ${systemHealth.status} (Last checked: ${systemHealth.lastCheck.toLocaleTimeString('bg-BG')})`}
              >
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  systemHealth.status === 'healthy'
                    ? 'bg-green-500 animate-pulse'
                    : systemHealth.status === 'degraded'
                    ? 'bg-yellow-500 animate-pulse'
                    : 'bg-red-500 animate-bounce'
                }`}></div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {isAuthenticated && user ? (
                <>
                  {/* Desktop Navigation Menu */}
                  <nav className="hidden md:flex items-center space-x-4">
                    <Link
                      href="/dashboard"
                      className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Home className="w-4 h-4 mr-1.5" />
                      Начало
                    </Link>
                    <Link
                      href="/tools"
                      className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Bot className="w-4 h-4 mr-1.5" />
                      AI Инструменти
                    </Link>
                    <Link
                      href="/profile"
                      className="flex items-center text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <User className="w-4 h-4 mr-1.5" />
                      Профил
                    </Link>
                    {user.role === 'owner' && (
                      <Link
                        href="/admin"
                        className="flex items-center text-gray-600 hover:text-purple-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-1.5" />
                        Админ панел
                      </Link>
                    )}
                  </nav>

                  {/* Current time display */}
                  <div className="hidden sm:flex items-center text-sm text-gray-600 bg-gray-100/50 px-3 py-1 rounded-full backdrop-blur-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    {mounted ? currentTime : '--:--:--'}
                  </div>

                  {/* Mobile menu button */}
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                  >
                    {mobileMenuOpen ? (
                      <X className="w-6 h-6" />
                    ) : (
                      <Menu className="w-6 h-6" />
                    )}
                  </button>

                  {/* User info - hidden on small screens, shown on medium+ */}
                  <div className="hidden sm:block text-sm bg-gradient-to-r from-blue-50 to-purple-50 px-3 md:px-4 py-2 rounded-full border border-blue-200/50">
                    <span className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                      {user.name}
                    </span>
                    <span className="hidden md:inline text-gray-500 ml-2 text-xs">
                      (ID: {user.id})
                    </span>
                  </div>

                  {/* Logout button - compact on mobile */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                  >
                    <span className="hidden sm:inline">Изход</span>
                    <LogOut className="sm:hidden w-4 h-4" />
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-600 bg-yellow-50 px-3 md:px-4 py-2 rounded-full border border-yellow-200">
                  <span className="hidden sm:inline">🔓 Не сте влезли в системата</span>
                  <span className="sm:hidden">🔓</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && isAuthenticated && user && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-b border-white/20 shadow-lg">
            <div className="px-4 py-3 space-y-3">
              {/* User info on mobile */}
              <div className="text-sm bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-lg border border-blue-200/50">
                <div className="font-semibold text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  {user.name}
                </div>
                <div className="text-gray-500 text-xs">ID: {user.id}</div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-gray-600 hover:text-blue-600 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-gray-50 hover:bg-blue-50"
                >
                  <Home className="w-4 h-4" />
                  <span className="ml-2">Начало</span>
                </Link>
                <Link
                  href="/tools"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-gray-600 hover:text-blue-600 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-gray-50 hover:bg-blue-50"
                >
                  <Bot className="w-4 h-4" />
                  <span className="ml-2">AI Инструменти</span>
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center text-gray-600 hover:text-blue-600 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-gray-50 hover:bg-blue-50"
                >
                  <User className="w-4 h-4" />
                  <span className="ml-2">Профил</span>
                </Link>
                {user.role === 'owner' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center text-gray-600 hover:text-purple-600 px-4 py-3 rounded-lg text-sm font-medium transition-colors bg-purple-50 hover:bg-purple-100"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="ml-2">Админ панел</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-sm font-medium bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">
              © 2025 Vibecode Full-Stack Starter Kit
            </div>
            <div className="text-xs text-gray-300 mt-1 flex items-center justify-center">
              <span>Powered by</span>
              <span className="mx-2 font-semibold text-red-400">Laravel</span>
              <span>+</span>
              <span className="mx-2 font-semibold text-blue-400">Next.js</span>
              <span>+</span>
              <span className="mx-2 font-semibold text-green-400">Docker</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}