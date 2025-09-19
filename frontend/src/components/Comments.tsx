'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ToolsAPI, ToolComment, CommentsResponse } from '@/lib/tools';
import { MessageCircle, Send, Edit2, Trash2 } from 'lucide-react';

interface CommentsProps {
  toolId: number;
}

export default function Comments({ toolId }: CommentsProps) {
  const { token, user } = useAuth();
  const [comments, setComments] = useState<ToolComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadComments = async (page: number = 1, append: boolean = false) => {
    if (!token) return;

    try {
      setLoading(true);
      const response: CommentsResponse = await ToolsAPI.getComments(token, toolId, page);

      if (append) {
        setComments(prev => [...prev, ...response.data]);
      } else {
        setComments(response.data);
      }

      setCurrentPage(response.current_page);
      setHasMore(response.current_page < response.last_page);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при зареждане на коментарите');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [token, toolId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await ToolsAPI.addComment(token, toolId, newComment.trim());
      setComments(prev => [response.comment, ...prev]);
      setNewComment('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при добавяне на коментар');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!token || !editText.trim()) return;

    try {
      const response = await ToolsAPI.updateComment(token, toolId, commentId, editText.trim());
      setComments(prev => prev.map(comment =>
        comment.id === commentId ? response.comment : comment
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при обновяване на коментара');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!token || !confirm('Сигурни ли сте, че искате да изтриете този коментар?')) return;

    try {
      await ToolsAPI.deleteComment(token, toolId, commentId);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при изтриване на коментара');
    }
  };

  const startEdit = (comment: ToolComment) => {
    setEditingComment(comment.id);
    setEditText(comment.comment);
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bg-BG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const loadMoreComments = () => {
    if (hasMore && !loading) {
      loadComments(currentPage + 1, true);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="w-6 h-6 text-blue-600 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">
          Коментари ({comments.length})
        </h3>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button
            onClick={() => setError('')}
            className="float-right text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        <div className="flex space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Напишете коментар..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={1000}
              disabled={submitting}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-500">
                {newComment.length}/1000 символа
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Изпращане...' : 'Коментирай'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      {loading && comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Зареждане на коментарите...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Все още няма коментари</p>
          <p className="text-sm">Бъдете първи, който ще коментира!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {comment.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{comment.user.name}</p>
                    <p className="text-sm text-gray-500">{formatDate(comment.created_at)}</p>
                  </div>
                </div>

                {/* Edit/Delete buttons for comment owner or admin */}
                {(user?.id === comment.user_id || user?.role === 'owner') && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(comment)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Редактиране"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Изтриване"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Comment Content */}
              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    maxLength={1000}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={cancelEdit}
                      className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    >
                      Отказ
                    </button>
                    <button
                      onClick={() => handleEditComment(comment.id)}
                      disabled={!editText.trim()}
                      className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                      Запази
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
              )}
            </div>
          ))}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMoreComments}
                disabled={loading}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:bg-gray-300"
              >
                {loading ? 'Зареждане...' : 'Зареди още коментари'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}