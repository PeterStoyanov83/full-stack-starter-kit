'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import ToolForm from '@/components/ToolForm';

export default function CreateToolPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  const handleSuccess = (tool: any) => {
    router.push('/tools');
  };

  const handleCancel = () => {
    router.back();
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
        <ToolForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </Layout>
  );
}