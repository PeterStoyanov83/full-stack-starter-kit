'use client';

import React, {useState, useEffect} from 'react';
import {useAuth} from '@/contexts/AuthContext';
import {useRouter} from 'next/navigation';
import Layout from '@/components/Layout';
import {ToolsAPI, Tool, Category, Tag, ToolsResponse} from '@/lib/tools';
import {
    Search,
    FolderOpen,
    Users,
    Trash2,
    Tag as TagIcon,
    ChevronDown,
    Grid3X3,
    List,
    Plus,
    AlertCircle,
    ExternalLink,
    Eye,
    Edit,
    Wrench,
    Star,
    MessageCircle
} from 'lucide-react';
import StarRating from '@/components/StarRating';

// Helper function to extract domain and get favicon from tool URL
const getFaviconUrl = (url: string): string => {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const domain = urlObj.hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
        return ''; // Return empty string for invalid URLs
    }
};

export default function ToolsPage() {
    const {isAuthenticated, token, user} = useAuth();
    const router = useRouter();

    const [tools, setTools] = useState<Tool[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // View mode
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Tags accordion
    const [tagsExpanded, setTagsExpanded] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
    }, [isAuthenticated, router]);

    const loadInitialData = async () => {
        if (!token) return;

        try {
            const [categoriesData, tagsData] = await Promise.all([
                ToolsAPI.getCategories(token),
                ToolsAPI.getTags(token)
            ]);

            setCategories(categoriesData);
            setTags(tagsData);
        } catch (error) {
            console.error('Error loading initial data:', error);
            setError('Грешка при зареждане на данните');
        }
    };

    const loadTools = async (page: number = 1, append: boolean = false) => {
        if (!token) return;

        setLoading(true);
        setError('');

        try {
            const filters = {
                search: searchTerm || undefined,
                category_id: selectedCategory,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                role: selectedRole || undefined,
                page,
                per_page: 12
            };

            const response: ToolsResponse = await ToolsAPI.getTools(token, filters);

            if (append) {
                setTools(prev => [...prev, ...response.data]);
            } else {
                setTools(response.data);
            }

            setCurrentPage(response.meta?.current_page || page);
            setTotalPages(response.meta?.last_page || 1);
            setHasMore((response.meta?.current_page || 0) < (response.meta?.last_page || 1));

        } catch (error) {
            setError(error instanceof Error ? error.message : 'Грешка при зареждане на инструментите');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, [token]);

    useEffect(() => {
        if (token) {
            loadTools(1, false);
        }
    }, [token, searchTerm, selectedCategory, selectedTags, selectedRole]);

    const handleTagToggle = (tagId: number) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(id => id !== tagId)
                : [...prev, tagId]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory(undefined);
        setSelectedTags([]);
        setSelectedRole('');
    };

    const loadMoreTools = () => {
        if (hasMore && !loading) {
            loadTools(currentPage + 1, true);
        }
    };

    const handleDeleteTool = async (toolId: number) => {
        if (!token || !confirm('Сигурни ли сте, че искате да изтриете този инструмент?')) return;

        try {
            await ToolsAPI.deleteTool(token, toolId);
            setTools(prev => prev.filter(tool => tool.id !== toolId));
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

    return (
        <Layout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6 md:mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                            AI Инструменти
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600">Открийте и споделете полезни AI
                            инструменти</p>
                    </div>
                    <button
                        onClick={() => router.push('/tools/create')}
                        className="flex items-center justify-center w-full md:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 md:px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                        <Plus className="w-4 h-4 mr-2"/>
                        <span className="hidden sm:inline">Добави инструмент</span>
                        <span className="sm:hidden">Добави</span>
                    </button>
                </div>

                {/* Filters */}
                <div
                    className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Search className="w-4 h-4 mr-1.5"/>
                                Търсене
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Търси..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <FolderOpen className="w-4 h-4 mr-1.5"/>
                                Категория
                            </label>
                            <select
                                value={selectedCategory || ''}
                                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : undefined)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Всички</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.icon} {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                                <Users className="w-4 h-4 mr-1.5"/>
                                Роля
                            </label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                                <option value="">Всички</option>
                                <option value="owner">Owner</option>
                                <option value="frontend">Frontend</option>
                                <option value="backend">Backend</option>
                                <option value="pm">PM</option>
                                <option value="qa">QA</option>
                                <option value="designer">Дизайнер</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="flex items-center justify-center w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                            >
                                <Trash2 className="w-4 h-4 mr-1.5"/>
                                <span className="hidden sm:inline">Изчисти филтрите</span>
                                <span className="sm:hidden">Изчисти</span>
                            </button>
                        </div>
                    </div>

                    {/* Tags Filter - Accordion */}
                    <div className="mt-4">
                        <button
                            onClick={() => setTagsExpanded(!tagsExpanded)}
                            className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                        >
              <span className="flex items-center">
                <TagIcon className="w-4 h-4 mr-1.5"/>
                Тагове
                  {selectedTags.length > 0 && (
                      <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                    {selectedTags.length}
                  </span>
                  )}
              </span>
                            <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${tagsExpanded ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {tagsExpanded && (
                            <div className="mt-3 flex flex-wrap gap-1 sm:gap-2 animate-fadeIn">
                                {tags.map((tag) => (
                                    <button
                                        key={tag.id}
                                        onClick={() => handleTagToggle(tag.id)}
                                        className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 ${
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
                        )}
                    </div>
                </div>

                {/* View Mode Toggle */}
                {tools.length > 0 && (
                    <div className="flex justify-between items-center mb-6">
                        <div className="text-sm text-gray-600">
                            Намерени {tools.length} {tools.length === 1 ? 'инструмент' : 'инструмента'}
                        </div>
                        <div className="flex bg-white/80 backdrop-blur-md rounded-lg border border-gray-200 p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    viewMode === 'grid'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                <Grid3X3 className="w-4 h-4"/>
                                <span className="hidden sm:inline ml-2">Мрежа</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                    viewMode === 'list'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                                }`}
                            >
                                <List className="w-4 h-4"/>
                                <span className="hidden sm:inline ml-2">Списък</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div
                        className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
                        <AlertCircle className="w-5 h-5 mr-3 text-red-500"/>
                        {error}
                    </div>
                )}

                {/* Tools Grid */}
                {loading && tools.length === 0 ? (
                    <div className="text-center py-20">
                        <div
                            className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Зареждане на инструментите...</p>
                    </div>
                ) : tools.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Няма намерени инструменти</h3>
                        <p className="text-gray-500 mb-4">Опитайте с различни филтри или добавете нов инструмент</p>
                        <button
                            onClick={() => router.push('/tools/create')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Добави първия инструмент
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Grid View */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                {tools.map((tool) => (
                                    <div
                                        key={tool.id}
                                        onClick={() => router.push(`/tools/${tool.id}`)}
                                        className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
                                    >
                                        {/* Tool Header */}
                                        <div className="flex justify-between items-start mb-3 sm:mb-4">
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center mb-2">
                                                    {/* Tool Favicon */}
                                                    <div className="flex-shrink-0 mr-3">
                                                        {getFaviconUrl(tool.link) ? (
                                                            <img
                                                                src={getFaviconUrl(tool.link)}
                                                                alt={`${tool.name} favicon`}
                                                                className="w-8 h-8 rounded-lg border border-gray-200"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                                }}
                                                            />
                                                        ) : null}
                                                        <div
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${getFaviconUrl(tool.link) ? 'hidden' : ''}`}
                                                            style={{backgroundColor: tool.category?.color || '#6B7280'}}
                                                        >
                                                            {tool.category?.icon || <Wrench className="w-4 h-4"/>}
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{tool.name}</h3>
                                                    </div>
                                                </div>
                                                {tool.category && (
                                                    <div className="flex items-center mb-2">
                            <span
                                className="px-2 py-1 rounded-full text-xs font-medium text-white truncate"
                                style={{backgroundColor: tool.category.color}}
                            >
                              {tool.category.icon} <span className="hidden sm:inline">{tool.category.name}</span>
                            </span>
                                                    </div>
                                                )}
                                            </div>
                                            {(user.id === tool.user_id || user.role === 'owner') && (
                                                <div className="flex space-x-1 flex-shrink-0">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/tools/${tool.id}/edit`);
                                                        }}
                                                        className="text-blue-600 hover:text-blue-800 p-1 touch-manipulation"
                                                        title="Редактиране"
                                                    >
                                                        <Edit className="w-4 h-4"/>
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteTool(tool.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-800 p-1 touch-manipulation"
                                                        title="Изтриване"
                                                    >
                                                        <Trash2 className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-gray-600 mb-3 sm:mb-4 text-sm line-clamp-3">{tool.description}</p>

                                        {/* Rating and Comments */}
                                        <div className="flex items-center justify-between mb-3 sm:mb-4 text-sm">
                                            <div className="flex items-center space-x-3">
                                                {/* Rating */}
                                                <div className="flex items-center space-x-1">
                                                    <StarRating
                                                        value={tool.ratings_avg_rating || 0}
                                                        readonly
                                                        size="sm"
                                                        showValue={false}
                                                    />
                                                    <span className="text-xs text-gray-600">
                            {tool.ratings_avg_rating ? Number(tool.ratings_avg_rating).toFixed(1) : '0.0'}
                          </span>
                                                    <span className="text-xs text-gray-400">
                            ({tool.ratings_count || 0})
                          </span>
                                                </div>

                                                {/* Comments */}
                                                <div className="flex items-center space-x-1 text-gray-500">
                                                    <MessageCircle className="w-4 h-4"/>
                                                    <span className="text-xs">
                            {tool.comments_count || 0}
                          </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        {tool.tags && tool.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mb-3 sm:mb-4">
                                                {tool.tags.slice(0, 2).map((tag) => (
                                                    <span
                                                        key={tag.id}
                                                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                                        style={{backgroundColor: tag.color}}
                                                    >
                            {tag.name}
                          </span>
                                                ))}
                                                {tool.tags.length > 2 && (
                                                    <span
                                                        className="px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            +{tool.tags.length - 2}
                          </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Footer */}
                                        <div
                                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-3 sm:pt-4 border-t border-gray-200 space-y-2 sm:space-y-0">
                                            <div className="text-xs text-gray-500 truncate">
                                                От: {tool.creator?.name}
                                            </div>
                                            <div className="flex justify-center">
                                                <a
                                                    href={tool.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="flex items-center justify-center bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors touch-manipulation"
                                                >
                                                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-1"/>
                                                    <span className="hidden sm:inline">Отвори</span>
                                                    <span className="sm:hidden sr-only">Отвори</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* List View - Compact */}
                        {viewMode === 'list' && (
                            <div
                                className="bg-white/80 backdrop-blur-md rounded-lg shadow-md border border-white/20 overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {tools.map((tool, index) => (
                                        <div
                                            key={tool.id}
                                            onClick={() => router.push(`/tools/${tool.id}`)}
                                            className="flex items-center justify-between p-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        >
                                            {/* Left: Tool Info */}
                                            <div className="flex items-center flex-1 min-w-0 space-x-3">
                                                {/* Tool Favicon */}
                                                <div className="flex-shrink-0">
                                                    {getFaviconUrl(tool.link) ? (
                                                        <img
                                                            src={getFaviconUrl(tool.link)}
                                                            alt={`${tool.name} favicon`}
                                                            className="w-8 h-8 rounded-lg border border-gray-200"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm ${getFaviconUrl(tool.link) ? 'hidden' : ''}`}
                                                        style={{backgroundColor: tool.category?.color || '#6B7280'}}
                                                    >
                                                        {tool.category?.icon || <Wrench className="w-4 h-4"/>}
                                                    </div>
                                                </div>

                                                {/* Tool Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-sm font-semibold text-gray-900 truncate">{tool.name}</h3>
                                                    <p className="text-xs text-gray-500 truncate">{tool.description}</p>

                                                    {/* Rating and Comments */}
                                                    <div className="flex items-center space-x-3 mt-1">
                                                        {/* Rating */}
                                                        <div className="flex items-center space-x-1">
                                                            <StarRating
                                                                value={tool.ratings_avg_rating || 0}
                                                                readonly
                                                                size="sm"
                                                                showValue={false}
                                                            />
                                                            <span className="text-xs text-gray-600">
                                {tool.ratings_avg_rating ? Number(tool.ratings_avg_rating).toFixed(1) : '0.0'}
                              </span>
                                                            <span className="text-xs text-gray-400">
                                ({tool.ratings_count || 0})
                              </span>
                                                        </div>

                                                        {/* Comments */}
                                                        <div className="flex items-center space-x-1 text-gray-500">
                                                            <MessageCircle className="w-3 h-3"/>
                                                            <span className="text-xs">
                                {tool.comments_count || 0}
                              </span>
                                                        </div>
                                                    </div>

                                                    {/* Tags - only show first 2 */}
                                                    {tool.tags && tool.tags.length > 0 && (
                                                        <div className="flex space-x-1 mt-1">
                                                            {tool.tags.slice(0, 2).map((tag) => (
                                                                <span
                                                                    key={tag.id}
                                                                    className="px-1.5 py-0.5 rounded text-xs font-medium text-white"
                                                                    style={{
                                                                        backgroundColor: tag.color,
                                                                        fontSize: '10px'
                                                                    }}
                                                                >
                                  {tag.name}
                                </span>
                                                            ))}
                                                            {tool.tags.length > 2 && (
                                                                <span
                                                                    className="text-xs text-gray-400">+{tool.tags.length - 2}</span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Creator - hidden on small screens */}
                                                <div className="hidden sm:block text-xs text-gray-400 truncate w-24">
                                                    {tool.creator?.name}
                                                </div>
                                            </div>

                                            {/* Right: Actions */}
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <a
                                                    href={tool.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                                                    title="Отвори инструмента"
                                                >
                                                    <ExternalLink className="w-3 h-3"/>
                                                </a>
                                                {(user.id === tool.user_id || user.role === 'owner') && (
                                                    <>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/tools/${tool.id}/edit`);
                                                            }}
                                                            className="text-blue-600 hover:text-blue-800 p-1"
                                                            title="Редактиране"
                                                        >
                                                            <Edit className="w-3 h-3"/>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTool(tool.id);
                                                            }}
                                                            className="text-red-600 hover:text-red-800 p-1"
                                                            title="Изтриване"
                                                        >
                                                            <Trash2 className="w-3 h-3"/>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Load More Button */}
                        {hasMore && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={loadMoreTools}
                                    disabled={loading}
                                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                                        loading
                                            ? 'bg-gray-400 text-white cursor-not-allowed'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 hover:shadow-lg transform hover:scale-105'
                                    }`}
                                >
                                    {loading ? 'Зареждане...' : 'Зареди още инструменти'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}