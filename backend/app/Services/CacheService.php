<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class CacheService
{
    /**
     * Cache keys used throughout the application
     */
    const CATEGORIES_WITH_TOOL_COUNTS = 'categories_with_tool_counts';
    const DASHBOARD_STATS = 'dashboard_stats';
    const CATEGORY_WITH_TOOLS_PREFIX = 'category_';

    /**
     * Clear all cached categories data
     */
    public static function clearCategoriesCache(): void
    {
        Cache::forget(self::CATEGORIES_WITH_TOOL_COUNTS);

        // Clear individual category caches
        Cache::flush(); // For simplicity, we flush all cache when categories change
    }

    /**
     * Clear dashboard statistics cache
     */
    public static function clearDashboardCache(): void
    {
        Cache::forget(self::DASHBOARD_STATS);
    }

    /**
     * Clear cache for a specific category
     */
    public static function clearCategoryCache(int $categoryId): void
    {
        Cache::forget(self::CATEGORY_WITH_TOOLS_PREFIX . "{$categoryId}_with_tools");
    }

    /**
     * Clear all tool-related caches
     */
    public static function clearToolCaches(): void
    {
        self::clearCategoriesCache();
        self::clearDashboardCache();
    }

    /**
     * Warm up frequently accessed caches
     */
    public static function warmUpCaches(): void
    {
        // This can be called after seeding or major updates

        // Warm up categories cache
        \App\Models\Category::active()
            ->withCount('activeTools')
            ->orderBy('name')
            ->get();

        // Warm up dashboard stats
        Cache::remember(self::DASHBOARD_STATS, 900, function () {
            return [
                'total_tools' => \App\Models\Tool::count(),
                'approved_tools' => \App\Models\Tool::approved()->count(),
                'pending_tools' => \App\Models\Tool::pending()->count(),
                'rejected_tools' => \App\Models\Tool::rejected()->count(),
                'total_categories' => \App\Models\Category::count(),
                'active_categories' => \App\Models\Category::active()->count(),
                'total_users' => \App\Models\User::count(),
                'tools_by_category' => \App\Models\Category::withCount('tools')->get()->pluck('tools_count', 'name'),
                'recent_tools' => \App\Models\Tool::latest()->take(5)->with('category', 'creator')->get(),
            ];
        });
    }

    /**
     * Get cache statistics
     */
    public static function getCacheStats(): array
    {
        try {
            $redis = app('redis');
            $info = $redis->info();

            return [
                'status' => 'connected',
                'version' => $info['redis_version'] ?? 'unknown',
                'uptime_seconds' => $info['uptime_in_seconds'] ?? 0,
                'uptime_human' => gmdate('H:i:s', $info['uptime_in_seconds'] ?? 0),
                'connected_clients' => $info['connected_clients'] ?? 0,
                'used_memory_human' => $info['used_memory_human'] ?? '0B',
                'used_memory_peak_human' => $info['used_memory_peak_human'] ?? '0B',
                'total_commands_processed' => $info['total_commands_processed'] ?? 0,
                'instantaneous_ops_per_sec' => $info['instantaneous_ops_per_sec'] ?? 0,
                'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                'hit_rate' => $info['keyspace_hits'] > 0 ?
                    round($info['keyspace_hits'] / ($info['keyspace_hits'] + $info['keyspace_misses']) * 100, 2) . '%' : '0%',
                'total_keys' => $redis->dbsize(),
                'cached_data' => [
                    'categories_cached' => Cache::has(self::CATEGORIES_WITH_TOOL_COUNTS),
                    'dashboard_stats_cached' => Cache::has(self::DASHBOARD_STATS),
                ],
                'timestamp' => now()->toISOString()
            ];
        } catch (\Exception $e) {
            return [
                'status' => 'error',
                'message' => 'Could not connect to Redis',
                'error' => $e->getMessage()
            ];
        }
    }
}