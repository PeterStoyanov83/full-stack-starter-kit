'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ToolsAPI, ToolRatingStats } from '@/lib/tools';
import StarRating from './StarRating';
import { Star, Users, X } from 'lucide-react';

interface ToolRatingProps {
  toolId: number;
}

export default function ToolRating({ toolId }: ToolRatingProps) {
  const { token } = useAuth();
  const [ratingStats, setRatingStats] = useState<ToolRatingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadRating = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const stats = await ToolsAPI.getRating(token, toolId);
      setRatingStats(stats);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при зареждане на рейтинга');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRating();
  }, [token, toolId]);

  const handleRatingSubmit = async (rating: number) => {
    if (!token || submitting) return;

    try {
      setSubmitting(true);
      const response = await ToolsAPI.submitRating(token, toolId, rating);

      setRatingStats(prev => prev ? {
        ...prev,
        average_rating: response.average_rating,
        rating_count: response.rating_count,
        user_rating: rating
      } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при оценяване');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveRating = async () => {
    if (!token || !confirm('Сигурни ли сте, че искате да премахнете оценката си?')) return;

    try {
      setSubmitting(true);
      const response = await ToolsAPI.removeRating(token, toolId);

      setRatingStats(prev => prev ? {
        ...prev,
        average_rating: response.average_rating,
        rating_count: response.rating_count,
        user_rating: null
      } : null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при премахване на оценката');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Зареждане на рейтинга...</p>
        </div>
      </div>
    );
  }

  if (!ratingStats) return null;

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center mb-6">
        <Star className="w-6 h-6 text-yellow-500 mr-2" />
        <h3 className="text-xl font-semibold text-gray-900">Рейтинг</h3>
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

      {/* Overall Rating */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {ratingStats.average_rating > 0 ? ratingStats.average_rating.toFixed(1) : 'N/A'}
          </div>
          <StarRating value={ratingStats.average_rating} readonly size="lg" className="justify-center mb-2" />
          <div className="text-sm text-gray-600 flex items-center justify-center">
            <Users className="w-4 h-4 mr-1" />
            {ratingStats.rating_count} {ratingStats.rating_count === 1 ? 'оценка' : 'оценки'}
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingStats.rating_distribution[stars] || 0;
            const percentage = ratingStats.rating_count > 0
              ? (count / ratingStats.rating_count) * 100
              : 0;

            return (
              <div key={stars} className="flex items-center space-x-2 text-sm">
                <span className="w-2">{stars}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Rating Section */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Вашата оценка</h4>

        {ratingStats.user_rating ? (
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-3">
              <span className="text-gray-700">Вие оценихте с:</span>
              <StarRating value={ratingStats.user_rating} readonly size="md" />
              <span className="font-medium text-blue-600">{ratingStats.user_rating} {ratingStats.user_rating === 1 ? 'звезда' : 'звезди'}</span>
            </div>
            <button
              onClick={handleRemoveRating}
              disabled={submitting}
              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              title="Премахни оценката"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-3">Оценете този инструмент:</p>
            <div className="flex items-center space-x-3">
              <StarRating
                value={0}
                onChange={handleRatingSubmit}
                size="lg"
              />
              <span className="text-sm text-gray-600">Кликнете на звездите за оценка</span>
            </div>
            {submitting && (
              <div className="mt-2 text-sm text-blue-600">
                Записване на оценката...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}