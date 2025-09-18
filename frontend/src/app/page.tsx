'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Show loading screen for at least 3 seconds
      const timer = setTimeout(() => {
        setShowLoading(false);

        // Small delay for smooth transition
        setTimeout(() => {
          if (isAuthenticated) {
            router.push('/dashboard');
          } else {
            router.push('/login');
          }
        }, 300);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <Layout>
      <div className={`transition-all duration-500 ${showLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="text-center py-20">
          <div className="relative inline-block mb-8">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-blue-200 to-purple-200 border-t-blue-600 mx-auto shadow-lg"></div>
            <div className="absolute inset-0 rounded-full h-20 w-20 border-4 border-purple-100 border-t-purple-500 mx-auto animate-ping opacity-30"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
          </div>

          <div className="space-y-4">
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse">
              Зареждане на Vibecode...
            </p>
            <p className="text-gray-500 text-lg">
              Моля, изчакайте док подготвяме всичко за вас
            </p>
          </div>

          <div className="flex justify-center space-x-2 mt-8">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>

          {/* Progress indicator */}
          <div className="mt-12 max-w-md mx-auto">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse"
                   style={{ width: '100%', animation: 'loadingProgress 3s ease-in-out' }}></div>
            </div>
            <p className="text-sm text-gray-400 mt-2">Инициализиране на системата...</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
