'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ToolsAPI, CreateToolData, Category, Tag } from '@/lib/tools';
import { AlertCircle, Wrench, Link, FileText, Folder, BookOpen, Target, Lightbulb, Tag as TagIcon, Users, Check } from 'lucide-react';

interface ToolFormProps {
  onSuccess?: (tool: any) => void;
  onCancel?: () => void;
  initialData?: Partial<CreateToolData>;
  toolId?: number;
  isEdit?: boolean;
}

export default function ToolForm({ onSuccess, onCancel, initialData, toolId, isEdit = false }: ToolFormProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<CreateToolData>({
    name: initialData?.name || '',
    link: initialData?.link || '',
    description: initialData?.description || '',
    documentation: initialData?.documentation || '',
    usage_instructions: initialData?.usage_instructions || '',
    examples: initialData?.examples || '',
    category_id: initialData?.category_id || undefined,
    images: initialData?.images || [],
    tags: initialData?.tags || [],
    recommended_roles: initialData?.recommended_roles || [],
  });

  const [selectedTags, setSelectedTags] = useState<number[]>(initialData?.tags || []);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(initialData?.recommended_roles || []);

  const availableRoles = [
    { value: 'owner', label: 'Owner' },
    { value: 'frontend', label: 'Frontend разработчик' },
    { value: 'backend', label: 'Backend разработчик' },
    { value: 'pm', label: 'Project Manager' },
    { value: 'qa', label: 'QA тестер' },
    { value: 'designer', label: 'Дизайнер' },
  ];

  useEffect(() => {
    const loadData = async () => {
      if (!token) return;

      try {
        const [categoriesData, tagsData] = await Promise.all([
          ToolsAPI.getCategories(token),
          ToolsAPI.getTags(token)
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading form data:', error);
        setError('Грешка при зареждане на данните за формата');
      }
    };

    loadData();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Трябва да сте влезли в системата');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        tags: selectedTags,
        recommended_roles: selectedRoles,
      };

      let result;
      if (isEdit && toolId) {
        result = await ToolsAPI.updateTool(token, toolId, submitData);
      } else {
        result = await ToolsAPI.createTool(token, submitData);
      }

      onSuccess?.(result.tool);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Грешка при запазване на инструмента');
    } finally {
      setLoading(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleRoleToggle = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    );
  };

  return (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {isEdit ? 'Редактиране на инструмент' : 'Добавяне на нов AI инструмент'}
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          {isEdit ? 'Обновете информацията за инструмента' : 'Попълнете информацията за новия инструмент'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-3 text-red-500" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center"><Wrench className="w-4 h-4 mr-1.5" />Име на инструмента *</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Например: ChatGPT, Claude, GitHub Copilot"
            />
          </div>

          <div>
            <label htmlFor="link" className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center"><Link className="w-4 h-4 mr-1.5" />Линк към инструмента *</span>
            </label>
            <input
              id="link"
              type="url"
              required
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center"><FileText className="w-4 h-4 mr-1.5" />Описание *</span>
          </label>
          <textarea
            id="description"
            required
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Кратко описание на какво прави инструментът..."
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center"><Folder className="w-4 h-4 mr-1.5" />Категория</span>
          </label>
          <select
            id="category_id"
            value={formData.category_id || ''}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value ? parseInt(e.target.value) : undefined })}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
          >
            <option value="">Изберете категория</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Documentation and Usage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="documentation" className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1.5" />Официална документация</span>
            </label>
            <textarea
              id="documentation"
              rows={3}
              value={formData.documentation}
              onChange={(e) => setFormData({ ...formData, documentation: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Линкове към документация или описание..."
            />
          </div>

          <div>
            <label htmlFor="usage_instructions" className="block text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center"><Target className="w-4 h-4 mr-1.5" />Как се използва</span>
            </label>
            <textarea
              id="usage_instructions"
              rows={3}
              value={formData.usage_instructions}
              onChange={(e) => setFormData({ ...formData, usage_instructions: e.target.value })}
              className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Стъпки за използване на инструмента..."
            />
          </div>
        </div>

        {/* Examples */}
        <div>
          <label htmlFor="examples" className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center"><Lightbulb className="w-4 h-4 mr-1.5" />Реални примери (опционално)</span>
          </label>
          <textarea
            id="examples"
            rows={3}
            value={formData.examples}
            onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
            className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
            placeholder="Примери за използване, случаи..."
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center"><TagIcon className="w-4 h-4 mr-1.5" />Тагове</span>
          </label>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => handleTagToggle(tag.id)}
                className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 touch-manipulation ${
                  selectedTags.includes(tag.id)
                    ? 'text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={{
                  backgroundColor: selectedTags.includes(tag.id) ? tag.color : undefined
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        {/* Recommended Roles */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center"><Users className="w-4 h-4 mr-1.5" />Препоръчителни роли</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableRoles.map((role) => (
              <label
                key={role.value}
                className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedRoles.includes(role.value)
                    ? 'bg-blue-50 border-2 border-blue-500 text-blue-700'
                    : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedRoles.includes(role.value)}
                  onChange={() => handleRoleToggle(role.value)}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded mr-3 flex items-center justify-center ${
                  selectedRoles.includes(role.value) ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  {selectedRoles.includes(role.value) && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">{role.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-300"
            >
              Отказ
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105'
            }`}
          >
            {loading ? 'Запазване...' : (isEdit ? 'Обновяване' : 'Създаване')}
          </button>
        </div>
      </form>
    </div>
  );
}