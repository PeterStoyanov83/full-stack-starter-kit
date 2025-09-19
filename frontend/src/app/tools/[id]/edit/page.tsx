'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import Layout from '@/components/Layout';
import ToolForm from '@/components/ToolForm';
import { ToolsAPI, Tool, CreateToolData } from '@/lib/tools';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function EditToolPage() {
  const { isAuthenticated, token, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toolId = parseInt(params.id as string);

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

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

  const handleApprove = async () => {
    if (!token || !tool) return;

    try {
      setActionLoading(true);
      await ToolsAPI.approveTool(token, tool.id);
      setTool({ ...tool, status: 'approved', approved_at: new Date().toISOString() });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при одобряване');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!token || !tool || !rejectionReason.trim()) return;

    try {
      setActionLoading(true);
      await ToolsAPI.rejectTool(token, tool.id, rejectionReason);
      setTool({ ...tool, status: 'rejected', rejection_reason: rejectionReason });
      setShowRejectModal(false);
      setRejectionReason('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при отхвърляне');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };

    const icons = {
      pending: <AlertTriangle className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />
    };

    const labels = {
      pending: 'Чакащ одобрение',
      approved: 'Одобрен',
      rejected: 'Отхвърлен'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {icons[status as keyof typeof icons]}
        <span className="ml-1">{labels[status as keyof typeof labels]}</span>
      </span>
    );
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
            className="text-blue-600 hover:text-blue-800 flex items-center mb-4"
          >
            ← Обратно към детайлите на инструмента
          </button>

          {/* Tool Status and Admin Controls */}
          {user.role === 'owner' && (
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Статус на инструмента</h3>
                  <div className="flex items-center space-x-4">
                    {getStatusBadge(tool.status)}
                    {tool.status === 'approved' && tool.approved_at && (
                      <span className="text-sm text-gray-500">
                        Одобрен на: {new Date(tool.approved_at).toLocaleDateString('bg-BG')}
                      </span>
                    )}
                    {tool.status === 'rejected' && tool.rejection_reason && (
                      <span className="text-sm text-red-600">
                        Причина: {tool.rejection_reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-3">
                  {tool.status !== 'approved' && (
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {actionLoading ? 'Одобряване...' : 'Одобри'}
                    </button>
                  )}

                  {tool.status !== 'rejected' && (
                    <button
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Отхвърли
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <ToolForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          initialData={initialData}
          toolId={toolId}
          isEdit={true}
        />

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Отхвърляне на инструмент</h3>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Причина за отхвърляне *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Моля, обяснете защо отхвърляте този инструмент..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  disabled={actionLoading}
                >
                  Отказ
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading || !rejectionReason.trim()}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Отхвърляне...' : 'Отхвърли'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}