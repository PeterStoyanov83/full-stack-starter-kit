'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import { ToolsAPI, Tool } from '@/lib/tools';

export default function ToolDetailsPage() {
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
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Грешка при зареждане на инструмента');
      } finally {
        setLoading(false);
      }
    };

    loadTool();
  }, [isAuthenticated, token, toolId, router]);

  const handleDelete = async () => {
    if (!token || !tool || !confirm('Сигурни ли сте, че искате да изтриете този инструмент?')) return;

    try {
      await ToolsAPI.deleteTool(token, tool.id);
      router.push('/tools');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при изтриване');
    }
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

  const canEdit = user.id === tool.user_id || user.role === 'owner';

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <button
              onClick={() => router.push('/tools')}
              className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
            >
              ← Обратно към инструментите
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {tool.name}
            </h1>
            {tool.category && (
              <div className="flex items-center mb-4">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium text-white"
                  style={{ backgroundColor: tool.category.color }}
                >
                  {tool.category.icon} {tool.category.name}
                </span>
              </div>
            )}
          </div>

          {canEdit && (
            <div className="flex space-x-3">
              <button
                onClick={() => router.push(`/tools/${tool.id}/edit`)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                ✏️ Редактиране
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center"
              >
                🗑️ Изтриване
              </button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📝 Описание</h3>
              <p className="text-gray-600 leading-relaxed">{tool.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🔗 Достъп</h3>
              <a
                href={tool.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🚀 Отвори инструмента
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>

          {/* Documentation */}
          {tool.documentation && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">📚 Документация</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 whitespace-pre-wrap">{tool.documentation}</p>
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          {tool.usage_instructions && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🎯 Как се използва</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{tool.usage_instructions}</p>
              </div>
            </div>
          )}

          {/* Examples */}
          {tool.examples && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Примери за използване</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{tool.examples}</p>
              </div>
            </div>
          )}

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">🏷️ Тагове</h3>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 rounded-full text-sm font-medium text-white"
                    style={{ backgroundColor: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Creator Info */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">👤 Информация за създателя</h3>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {tool.creator?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{tool.creator?.name}</p>
                <p className="text-sm text-gray-500">{tool.creator?.email}</p>
                <p className="text-sm text-gray-500">Роля: {tool.creator?.role}</p>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Създаден на: {new Date(tool.created_at).toLocaleDateString('bg-BG')}
              {tool.updated_at !== tool.created_at && (
                <span> • Обновен на: {new Date(tool.updated_at).toLocaleDateString('bg-BG')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}