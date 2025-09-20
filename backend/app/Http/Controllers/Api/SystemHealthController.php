<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Redis;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Exception;

class SystemHealthController extends Controller
{
    /**
     * Get comprehensive system health status
     */
    public function status(): JsonResponse
    {
        return response()->json([
            'status' => 'healthy',
            'message' => 'System monitoring active',
            'timestamp' => now()->toISOString(),
            'version' => '1.0.0',
            'environment' => app()->environment(),
            'services' => [
                'database' => $this->getDatabaseStatus(),
                'cache' => $this->getCacheStatus(),
                'redis' => $this->getRedisStatus(),
                'authentication' => [
                    'status' => 'active',
                    'driver' => 'sanctum'
                ]
            ],
            'metrics' => [
                'redis' => $this->getRedisMetrics(),
                'database' => $this->getDatabaseMetrics(),
                'cache' => $this->getCacheMetrics()
            ]
        ]);
    }

    /**
     * Get real-time Redis metrics
     */
    public function redisMetrics(): JsonResponse
    {
        return response()->json([
            'redis' => $this->getRedisMetrics(),
            'timestamp' => now()->toISOString()
        ]);
    }

    /**
     * Get database connection status
     */
    private function getDatabaseStatus(): array
    {
        try {
            DB::connection()->getPdo();
            $connectionTime = microtime(true);
            DB::select('SELECT 1');
            $queryTime = microtime(true) - $connectionTime;

            return [
                'status' => 'connected',
                'name' => config('database.default'),
                'connection_time' => round($queryTime * 1000, 2) . 'ms'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'name' => config('database.default'),
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get cache system status
     */
    private function getCacheStatus(): array
    {
        try {
            $testKey = 'health_check_' . time();
            $testValue = 'test_' . uniqid();

            Cache::put($testKey, $testValue, 10);
            $retrieved = Cache::get($testKey);
            Cache::forget($testKey);

            return [
                'status' => $retrieved === $testValue ? 'active' : 'error',
                'driver' => config('cache.default')
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'driver' => config('cache.default'),
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get Redis connection status
     */
    private function getRedisStatus(): array
    {
        try {
            $connectionTime = microtime(true);
            $pong = Redis::ping();
            $responseTime = microtime(true) - $connectionTime;

            return [
                'status' => ($pong === true || $pong === 'PONG') ? 'connected' : 'error',
                'host' => config('database.redis.default.host'),
                'port' => config('database.redis.default.port'),
                'response_time' => round($responseTime * 1000, 2) . 'ms'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'host' => config('database.redis.default.host'),
                'port' => config('database.redis.default.port'),
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get detailed Redis metrics
     */
    private function getRedisMetrics(): array
    {
        try {
            $info = Redis::info();
            $keyspace = Redis::info('keyspace');

            return [
                'connection' => [
                    'connected_clients' => $info['connected_clients'] ?? 0,
                    'total_connections_received' => $info['total_connections_received'] ?? 0,
                    'rejected_connections' => $info['rejected_connections'] ?? 0
                ],
                'memory' => [
                    'used_memory' => $this->formatBytes($info['used_memory'] ?? 0),
                    'used_memory_human' => $info['used_memory_human'] ?? '0B',
                    'used_memory_peak' => $this->formatBytes($info['used_memory_peak'] ?? 0),
                    'used_memory_peak_human' => $info['used_memory_peak_human'] ?? '0B',
                    'memory_fragmentation_ratio' => $info['mem_fragmentation_ratio'] ?? 0
                ],
                'stats' => [
                    'total_commands_processed' => $info['total_commands_processed'] ?? 0,
                    'instantaneous_ops_per_sec' => $info['instantaneous_ops_per_sec'] ?? 0,
                    'keyspace_hits' => $info['keyspace_hits'] ?? 0,
                    'keyspace_misses' => $info['keyspace_misses'] ?? 0,
                    'hit_rate' => $this->calculateHitRate($info)
                ],
                'keyspace' => [
                    'total_keys' => $this->getTotalKeys($keyspace),
                    'databases' => $this->parseKeyspaceInfo($keyspace)
                ],
                'server' => [
                    'redis_version' => $info['redis_version'] ?? 'unknown',
                    'uptime_in_seconds' => $info['uptime_in_seconds'] ?? 0,
                    'uptime_in_days' => $info['uptime_in_days'] ?? 0
                ]
            ];
        } catch (Exception $e) {
            return [
                'error' => $e->getMessage(),
                'status' => 'unavailable'
            ];
        }
    }

    /**
     * Get database metrics
     */
    private function getDatabaseMetrics(): array
    {
        try {
            $tables = ['users', 'tools', 'categories', 'tags', 'tool_comments', 'tool_ratings'];
            $metrics = [];

            foreach ($tables as $table) {
                try {
                    $count = DB::table($table)->count();
                    $metrics[$table] = $count;
                } catch (Exception $e) {
                    $metrics[$table] = 'error';
                }
            }

            return $metrics;
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }

    /**
     * Get cache metrics
     */
    private function getCacheMetrics(): array
    {
        try {
            // Test cache performance
            $start = microtime(true);
            $testKey = 'performance_test_' . time();
            Cache::put($testKey, 'test_value', 10);
            $writeTime = microtime(true) - $start;

            $start = microtime(true);
            Cache::get($testKey);
            $readTime = microtime(true) - $start;

            Cache::forget($testKey);

            return [
                'write_time' => round($writeTime * 1000, 2) . 'ms',
                'read_time' => round($readTime * 1000, 2) . 'ms',
                'driver' => config('cache.default')
            ];
        } catch (Exception $e) {
            return [
                'error' => $e->getMessage(),
                'driver' => config('cache.default')
            ];
        }
    }

    /**
     * Format bytes to human readable format
     */
    private function formatBytes($bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    /**
     * Calculate Redis hit rate
     */
    private function calculateHitRate($info): float
    {
        $hits = $info['keyspace_hits'] ?? 0;
        $misses = $info['keyspace_misses'] ?? 0;
        $total = $hits + $misses;

        return $total > 0 ? round(($hits / $total) * 100, 2) : 0;
    }

    /**
     * Get total keys from keyspace info
     */
    private function getTotalKeys($keyspace): int
    {
        $total = 0;
        foreach ($keyspace as $db => $info) {
            if (strpos($db, 'db') === 0 && is_string($info)) {
                preg_match('/keys=(\d+)/', $info, $matches);
                $total += (int)($matches[1] ?? 0);
            }
        }
        return $total;
    }

    /**
     * Parse keyspace information
     */
    private function parseKeyspaceInfo($keyspace): array
    {
        $databases = [];
        foreach ($keyspace as $db => $info) {
            if (strpos($db, 'db') === 0 && is_string($info)) {
                preg_match_all('/(\w+)=(\d+)/', $info, $matches, PREG_SET_ORDER);
                $dbInfo = [];
                foreach ($matches as $match) {
                    $dbInfo[$match[1]] = (int)$match[2];
                }
                $databases[$db] = $dbInfo;
            }
        }
        return $databases;
    }
}