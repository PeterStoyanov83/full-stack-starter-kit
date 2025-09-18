'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ToolForm from '@/components/ToolForm';
import { ToolsAPI, Tool, CreateToolData } from '@/lib/tools';

export default function EditToolPage() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toolId = parseInt(params.id as string);

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadTool = async () => {
      if (!token || !toolId) return;

      try {
        setLoading(true);
        const toolData = await ToolsAPI.getTool(token, toolId);
        setTool(toolData);

        // Check if user can edit this tool
        if (user && user.id !== toolData.user_id && user.role !== 'owner') {
          setError('Нямате право да редактирате този инструмент');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Грешка при зареждане на инструмента');
      } finally {
        setLoading(false);
      }
    };

    loadTool();
  }, [isAuthenticated, token, toolId, user, router]);

  const handleSuccess = (updatedTool: any) => {
    router.push(`/tools/${updatedTool.id}`);
  };

  const handleCancel = () => {
    router.push(`/tools/${toolId}`);
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

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Зареждане на инструмента...</p>
        </div>
      </Layout>
    );
  }

  if (error || !tool) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h3 className="font-medium">Грешка</h3>
            <p>{error || 'Инструментът не е намерен'}</p>
          </div>
          <button
            onClick={() => router.push('/tools')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Обратно към инструментите
          </button>
        </div>
      </Layout>
    );
  }

  // Prepare initial data for the form
  const initialData: Partial<CreateToolData> = {
    name: tool.name,
    link: tool.link,
    description: tool.description,
    documentation: tool.documentation || undefined,
    usage_instructions: tool.usage_instructions || undefined,
    examples: tool.examples || undefined,
    category_id: tool.category_id || undefined,
    images: tool.images || [],
    tags: tool.tags?.map(tag => tag.id) || [],
    recommended_roles: tool.recommended_users?.map(user => user.role).filter((role, index, arr) => arr.indexOf(role) === index) || [],
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.push(`/tools/${toolId}`)}
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Обратно към детайлите на инструмента
          </button>
        </div>

        <ToolForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialData={initialData}
          toolId={toolId}
          isEdit={true}
        />
      </div>
    </Layout>
  );
}