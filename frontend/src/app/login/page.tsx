'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import LoginForm from '@/components/LoginForm';
import FirstLoginSetup from '@/components/FirstLoginSetup';

interface LoginResponse {
  user: any;
  token: string;
  requires_2fa_setup?: boolean;
}

export default function LoginPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [firstLoginData, setFirstLoginData] = useState<LoginResponse | null>(null);

  useEffect(() => {
    if (isAuthenticated && !firstLoginData) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router, firstLoginData]);

  // Show first login setup if user needs 2FA
  if (firstLoginData) {
    return (
      <FirstLoginSetup
        token={firstLoginData.token}
        user={firstLoginData.user}
        onComplete={() => {
          setFirstLoginData(null);
          router.push('/dashboard');
        }}
      />
    );
  }

  if (isAuthenticated) {
    return (
      <Layout>
        <div className="text-center py-20 animate-fadeIn">
          <div className="relative inline-block mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto shadow-lg"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-100 border-t-purple-500 mx-auto animate-ping opacity-30"></div>
          </div>
          <p className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Пренасочване към таблото...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-96 flex items-center justify-center animate-slideUp">
        <LoginForm
          onSuccess={() => {
            // Add a small delay for smooth transition
            setTimeout(() => router.push('/dashboard'), 200);
          }}
          onFirstLogin={(loginData) => {
            setFirstLoginData(loginData);
          }}
        />
      </div>
    </Layout>
  );
}