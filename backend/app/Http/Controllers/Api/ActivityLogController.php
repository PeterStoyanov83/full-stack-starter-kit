<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ActivityLogController extends Controller
{
    /**
     * Get paginated activity logs with filtering
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'action' => 'nullable|string',
            'entity_type' => 'nullable|string',
            'level' => 'nullable|in:info,warning,critical',
            'user_id' => 'nullable|integer|exists:users,id',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = ActivityLog::with('user')->latest();

        // Apply filters
        if ($request->filled('action')) {
            $query->byAction($request->action);
        }

        if ($request->filled('entity_type')) {
            $query->byEntityType($request->entity_type);
        }

        if ($request->filled('level')) {
            $query->byLevel($request->level);
        }

        if ($request->filled('user_id')) {
            $query->byUser($request->user_id);
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->inDateRange($request->start_date, $request->end_date);
        }

        $perPage = $request->get('per_page', 20);
        $activities = $query->paginate($perPage);

        // Transform the data to include computed attributes
        $activities->getCollection()->transform(function ($activity) {
            return [
                'id' => $activity->id,
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                    'role' => $activity->user->role,
                ] : null,
                'action' => $activity->action,
                'action_text' => $activity->action_text,
                'entity_type' => $activity->entity_type,
                'entity_id' => $activity->entity_id,
                'description' => $activity->description,
                'level' => $activity->level,
                'level_color' => $activity->level_color,
                'ip_address' => $activity->ip_address,
                'user_agent' => $activity->user_agent,
                'metadata' => $activity->metadata,
                'old_values' => $activity->old_values,
                'new_values' => $activity->new_values,
                'created_at' => $activity->created_at,
                'updated_at' => $activity->updated_at,
            ];
        });

        return response()->json($activities);
    }

    /**
     * Get activity summary for dashboard
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        $days = $request->get('days', 7);
        $summary = ActivityLogService::getActivitySummary($days);

        return response()->json([
            'period_days' => $days,
            'summary' => $summary,
        ]);
    }

    /**
     * Get activity logs for a specific entity
     */
    public function entityLogs(Request $request, string $entityType, int $entityId): JsonResponse
    {
        $request->validate([
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $perPage = $request->get('per_page', 10);

        $activities = ActivityLog::with('user')
            ->byEntityType($entityType)
            ->where('entity_id', $entityId)
            ->latest()
            ->paginate($perPage);

        // Transform the data
        $activities->getCollection()->transform(function ($activity) {
            return [
                'id' => $activity->id,
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                    'role' => $activity->user->role,
                ] : null,
                'action' => $activity->action,
                'action_text' => $activity->action_text,
                'description' => $activity->description,
                'level' => $activity->level,
                'level_color' => $activity->level_color,
                'old_values' => $activity->old_values,
                'new_values' => $activity->new_values,
                'created_at' => $activity->created_at,
            ];
        });

        return response()->json($activities);
    }

    /**
     * Get user's own activity logs
     */
    public function myLogs(Request $request): JsonResponse
    {
        $request->validate([
            'action' => 'nullable|string',
            'per_page' => 'nullable|integer|min:1|max:50',
        ]);

        $query = ActivityLog::byUser($request->user()->id)->latest();

        if ($request->filled('action')) {
            $query->byAction($request->action);
        }

        $perPage = $request->get('per_page', 20);
        $activities = $query->paginate($perPage);

        // Transform the data (exclude sensitive information for own logs)
        $activities->getCollection()->transform(function ($activity) {
            return [
                'id' => $activity->id,
                'action' => $activity->action,
                'action_text' => $activity->action_text,
                'entity_type' => $activity->entity_type,
                'entity_id' => $activity->entity_id,
                'description' => $activity->description,
                'level' => $activity->level,
                'level_color' => $activity->level_color,
                'metadata' => $activity->metadata,
                'created_at' => $activity->created_at,
            ];
        });

        return response()->json($activities);
    }

    /**
     * Get recent critical activities (admin only)
     */
    public function critical(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нужни са администраторски права'
            ], 403);
        }

        $request->validate([
            'limit' => 'nullable|integer|min:1|max:100',
        ]);

        $limit = $request->get('limit', 20);

        $activities = ActivityLog::critical()
            ->with('user')
            ->latest()
            ->take($limit)
            ->get();

        $activities->transform(function ($activity) {
            return [
                'id' => $activity->id,
                'user' => $activity->user ? [
                    'id' => $activity->user->id,
                    'name' => $activity->user->name,
                    'role' => $activity->user->role,
                ] : null,
                'action' => $activity->action,
                'action_text' => $activity->action_text,
                'description' => $activity->description,
                'level' => $activity->level,
                'ip_address' => $activity->ip_address,
                'metadata' => $activity->metadata,
                'created_at' => $activity->created_at,
            ];
        });

        return response()->json($activities);
    }

    /**
     * Export activity logs (admin only)
     */
    public function export(Request $request): JsonResponse
    {
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нужни са администраторски права'
            ], 403);
        }

        $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'format' => 'nullable|in:json,csv',
        ]);

        $format = $request->get('format', 'json');

        $activities = ActivityLog::with('user')
            ->inDateRange($request->start_date, $request->end_date)
            ->latest()
            ->get();

        if ($format === 'csv') {
            // Generate CSV data
            $csvData = [];
            $csvData[] = ['ID', 'User', 'Action', 'Entity Type', 'Entity ID', 'Description', 'Level', 'IP Address', 'Created At'];

            foreach ($activities as $activity) {
                $csvData[] = [
                    $activity->id,
                    $activity->user ? $activity->user->name : 'System',
                    $activity->action_text,
                    $activity->entity_type,
                    $activity->entity_id,
                    $activity->description,
                    $activity->level,
                    $activity->ip_address,
                    $activity->created_at->format('Y-m-d H:i:s'),
                ];
            }

            return response()->json([
                'format' => 'csv',
                'data' => $csvData,
                'count' => count($activities),
            ]);
        }

        // JSON format
        return response()->json([
            'format' => 'json',
            'data' => $activities,
            'count' => count($activities),
            'period' => [
                'start_date' => $request->start_date,
                'end_date' => $request->end_date,
            ],
        ]);
    }
}
