<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

class ActivityLogService
{
    /**
     * Log a user login
     */
    public static function logLogin(User $user): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $user->id,
            'action' => ActivityLog::ACTION_LOGIN,
            'description' => "Потребителят {$user->name} ({$user->role}) влезе в системата",
            'level' => ActivityLog::LEVEL_INFO,
            'metadata' => [
                'user_role' => $user->role,
                'login_time' => now()->toDateTimeString(),
            ]
        ]);
    }

    /**
     * Log a user logout
     */
    public static function logLogout(User $user): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $user->id,
            'action' => ActivityLog::ACTION_LOGOUT,
            'description' => "Потребителят {$user->name} ({$user->role}) излезе от системата",
            'level' => ActivityLog::LEVEL_INFO,
        ]);
    }

    /**
     * Log entity creation
     */
    public static function logCreated(Model $entity, User $user = null, array $metadata = []): ActivityLog
    {
        $entityType = class_basename($entity);
        $userName = $user ? $user->name : 'Системата';

        return ActivityLog::log([
            'user_id' => $user?->id,
            'action' => ActivityLog::ACTION_CREATED,
            'entity_type' => $entityType,
            'entity_id' => $entity->id,
            'new_values' => $entity->toArray(),
            'description' => $userName . " създаде {$entityType} \"" . ($entity->name ?? $entity->title ?? 'ID: ' . $entity->id) . "\"",
            'level' => ActivityLog::LEVEL_INFO,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log entity update
     */
    public static function logUpdated(Model $entity, array $oldValues, User $user = null, array $metadata = []): ActivityLog
    {
        $entityType = class_basename($entity);
        $userName = $user ? $user->name : 'Системата';

        return ActivityLog::log([
            'user_id' => $user?->id,
            'action' => ActivityLog::ACTION_UPDATED,
            'entity_type' => $entityType,
            'entity_id' => $entity->id,
            'old_values' => $oldValues,
            'new_values' => $entity->toArray(),
            'description' => $userName . " обнови {$entityType} \"" . ($entity->name ?? $entity->title ?? 'ID: ' . $entity->id) . "\"",
            'level' => ActivityLog::LEVEL_INFO,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log entity deletion
     */
    public static function logDeleted(Model $entity, User $user = null, array $metadata = []): ActivityLog
    {
        $entityType = class_basename($entity);
        $userName = $user ? $user->name : 'Системата';

        return ActivityLog::log([
            'user_id' => $user?->id,
            'action' => ActivityLog::ACTION_DELETED,
            'entity_type' => $entityType,
            'entity_id' => $entity->id,
            'old_values' => $entity->toArray(),
            'description' => $userName . " изтри {$entityType} \"" . ($entity->name ?? $entity->title ?? 'ID: ' . $entity->id) . "\"",
            'level' => ActivityLog::LEVEL_WARNING,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Log tool approval
     */
    public static function logToolApproved($tool, User $approver, array $metadata = []): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $approver->id,
            'action' => ActivityLog::ACTION_APPROVED,
            'entity_type' => 'Tool',
            'entity_id' => $tool->id,
            'description' => "{$approver->name} одобри инструмента \"{$tool->name}\"",
            'level' => ActivityLog::LEVEL_INFO,
            'metadata' => array_merge($metadata, [
                'tool_creator' => $tool->creator->name ?? 'Unknown',
                'tool_category' => $tool->category->name ?? 'Uncategorized',
            ]),
        ]);
    }

    /**
     * Log tool rejection
     */
    public static function logToolRejected($tool, User $approver, string $reason, array $metadata = []): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $approver->id,
            'action' => ActivityLog::ACTION_REJECTED,
            'entity_type' => 'Tool',
            'entity_id' => $tool->id,
            'description' => "{$approver->name} отказа инструмента \"{$tool->name}\" - причина: {$reason}",
            'level' => ActivityLog::LEVEL_WARNING,
            'metadata' => array_merge($metadata, [
                'tool_creator' => $tool->creator->name ?? 'Unknown',
                'tool_category' => $tool->category->name ?? 'Uncategorized',
                'rejection_reason' => $reason,
            ]),
        ]);
    }

    /**
     * Log 2FA activation
     */
    public static function log2FAEnabled(User $user, string $method, array $metadata = []): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $user->id,
            'action' => ActivityLog::ACTION_2FA_ENABLED,
            'description' => "{$user->name} активира двуфакторна автентикация ({$method})",
            'level' => ActivityLog::LEVEL_INFO,
            'metadata' => array_merge($metadata, [
                '2fa_method' => $method,
                'profile_status' => $user->profile_status,
            ]),
        ]);
    }

    /**
     * Log 2FA deactivation
     */
    public static function log2FADisabled(User $user, string $method, array $metadata = []): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $user->id,
            'action' => ActivityLog::ACTION_2FA_DISABLED,
            'description' => "{$user->name} деактивира двуфакторна автентикация ({$method})",
            'level' => ActivityLog::LEVEL_WARNING,
            'metadata' => array_merge($metadata, [
                '2fa_method' => $method,
            ]),
        ]);
    }

    /**
     * Log profile activation
     */
    public static function logProfileActivated(User $user, array $metadata = []): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $user->id,
            'action' => ActivityLog::ACTION_PROFILE_ACTIVATED,
            'description' => "{$user->name} активира профила си след настройване на 2FA",
            'level' => ActivityLog::LEVEL_INFO,
            'metadata' => array_merge($metadata, [
                'user_role' => $user->role,
                'activation_time' => now()->toDateTimeString(),
            ]),
        ]);
    }

    /**
     * Log security event
     */
    public static function logSecurityEvent(string $description, User $user = null, string $level = ActivityLog::LEVEL_CRITICAL, array $metadata = []): ActivityLog
    {
        return ActivityLog::log([
            'user_id' => $user?->id,
            'action' => 'security_event',
            'description' => $description,
            'level' => $level,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Get activity summary for dashboard
     */
    public static function getActivitySummary(int $days = 7): array
    {
        $startDate = now()->subDays($days);

        return [
            'total_activities' => ActivityLog::where('created_at', '>=', $startDate)->count(),
            'by_action' => ActivityLog::where('created_at', '>=', $startDate)
                ->groupBy('action')
                ->selectRaw('action, count(*) as count')
                ->pluck('count', 'action')
                ->toArray(),
            'by_level' => ActivityLog::where('created_at', '>=', $startDate)
                ->groupBy('level')
                ->selectRaw('level, count(*) as count')
                ->pluck('count', 'level')
                ->toArray(),
            'recent_critical' => ActivityLog::critical()
                ->where('created_at', '>=', $startDate)
                ->with('user')
                ->latest()
                ->take(5)
                ->get(),
            'most_active_users' => ActivityLog::where('created_at', '>=', $startDate)
                ->whereNotNull('user_id')
                ->groupBy('user_id')
                ->selectRaw('user_id, count(*) as activity_count')
                ->with('user')
                ->orderByDesc('activity_count')
                ->take(5)
                ->get(),
        ];
    }
}