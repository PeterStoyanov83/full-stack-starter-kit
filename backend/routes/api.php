<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\ToolController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\TwoFactorController;
use App\Http\Controllers\Api\ActivityLogController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API Status endpoint (public)
Route::get('/status', function () {
    return response()->json([
        'status' => 'healthy',
        'message' => 'API is running',
        'timestamp' => now()->toISOString(),
        'version' => '1.0.0',
        'environment' => app()->environment(),
        'services' => [
            'database' => [
                'status' => 'connected',
                'name' => config('database.default')
            ],
            'cache' => [
                'status' => 'active',
                'driver' => config('cache.default')
            ],
            'redis' => [
                'status' => 'connected',
                'host' => config('database.redis.default.host'),
                'port' => config('database.redis.default.port')
            ],
            'authentication' => [
                'status' => 'active',
                'driver' => 'sanctum'
            ]
        ],
        'endpoints' => [
            'public' => [
                'GET /api/status',
                'GET /api/categories',
                'GET /api/tags',
                'POST /api/login'
            ],
            'protected' => [
                'GET /api/user',
                'GET /api/dashboard',
                'GET /api/tools',
                'POST /api/tools',
                'PUT /api/tools/{id}',
                'DELETE /api/tools/{id}',
                'POST /api/logout'
            ]
        ]
    ]);
});

// Redis monitoring endpoint (public)
Route::get('/redis/stats', function () {
    try {
        $redis = app('redis');
        $info = $redis->info();

        return response()->json([
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
            'keys_list' => $redis->keys('*'),
            'timestamp' => now()->toISOString()
        ]);
    } catch (Exception $e) {
        return response()->json([
            'status' => 'error',
            'message' => 'Could not connect to Redis',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// Public routes for categories and tags (needed for tool filtering)
Route::apiResource('categories', CategoryController::class)->only(['index', 'show']);
Route::apiResource('tags', TagController::class)->only(['index', 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/dashboard', [DashboardController::class, 'index']);

    // AI Tools Management API Routes
    Route::apiResource('tools', ToolController::class)->middleware('role:owner|frontend|backend|qa')->except(['index', 'show']);
    Route::get('tools', [ToolController::class, 'index']);
    Route::get('tools/{tool}', [ToolController::class, 'show']);

    // Tool Approval Routes (Owner only)
    Route::middleware('admin')->group(function () {
        Route::get('/tools-pending', [ToolController::class, 'pending']);
        Route::post('/tools/{tool}/approve', [ToolController::class, 'approve']);
        Route::post('/tools/{tool}/reject', [ToolController::class, 'reject']);
        Route::get('/tools/approval/stats', [ToolController::class, 'approvalStats']);
    });

    // User Management API Routes (Admin only)
    Route::middleware('admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::get('/admin/stats', [UserController::class, 'stats']);
    });

    // Two-Factor Authentication Routes
    Route::prefix('2fa')->group(function () {
        Route::get('/status', [TwoFactorController::class, 'status']);
        Route::get('/methods', [TwoFactorController::class, 'methods']);
        Route::get('/instructions', [TwoFactorController::class, 'instructions']);
        Route::post('/setup', [TwoFactorController::class, 'setup']);
        Route::post('/enable', [TwoFactorController::class, 'enable']);
        Route::post('/disable', [TwoFactorController::class, 'disable']);
        Route::post('/send-code', [TwoFactorController::class, 'sendCode']);
        Route::post('/verify', [TwoFactorController::class, 'verify']);
        Route::get('/qr-code', [TwoFactorController::class, 'qrCode']);
        Route::post('/backup-codes', [TwoFactorController::class, 'generateBackupCodes']);
    });

    // Activity Log Routes
    Route::prefix('activity-logs')->group(function () {
        Route::get('/my-logs', [ActivityLogController::class, 'myLogs']);
        Route::get('/summary', [ActivityLogController::class, 'summary']);
        Route::get('/entity/{entityType}/{entityId}', [ActivityLogController::class, 'entityLogs']);

        // Admin-only routes
        Route::middleware('admin')->group(function () {
            Route::get('/', [ActivityLogController::class, 'index']);
            Route::get('/critical', [ActivityLogController::class, 'critical']);
            Route::post('/export', [ActivityLogController::class, 'export']);
        });
    });
});