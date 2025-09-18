<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'entity_type',
        'entity_id',
        'old_values',
        'new_values',
        'description',
        'ip_address',
        'user_agent',
        'level',
        'metadata',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'metadata' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Activity levels
    const LEVEL_INFO = 'info';
    const LEVEL_WARNING = 'warning';
    const LEVEL_CRITICAL = 'critical';

    // Common actions
    const ACTION_CREATED = 'created';
    const ACTION_UPDATED = 'updated';
    const ACTION_DELETED = 'deleted';
    const ACTION_APPROVED = 'approved';
    const ACTION_REJECTED = 'rejected';
    const ACTION_LOGIN = 'login';
    const ACTION_LOGOUT = 'logout';
    const ACTION_2FA_ENABLED = '2fa_enabled';
    const ACTION_2FA_DISABLED = '2fa_disabled';
    const ACTION_PROFILE_ACTIVATED = 'profile_activated';

    /**
     * Get the user who performed the activity
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the entity this activity relates to (polymorphic relationship)
     */
    public function entity()
    {
        if ($this->entity_type && $this->entity_id) {
            $modelClass = "App\\Models\\{$this->entity_type}";
            if (class_exists($modelClass)) {
                return $modelClass::find($this->entity_id);
            }
        }
        return null;
    }

    /**
     * Scope for filtering by action
     */
    public function scopeByAction(Builder $query, string $action): Builder
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for filtering by entity type
     */
    public function scopeByEntityType(Builder $query, string $entityType): Builder
    {
        return $query->where('entity_type', $entityType);
    }

    /**
     * Scope for filtering by level
     */
    public function scopeByLevel(Builder $query, string $level): Builder
    {
        return $query->where('level', $level);
    }

    /**
     * Scope for filtering by user
     */
    public function scopeByUser(Builder $query, int $userId): Builder
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeInDateRange(Builder $query, $startDate, $endDate): Builder
    {
        return $query->whereBetween('created_at', [$startDate, $endDate]);
    }

    /**
     * Scope for recent activities (last 30 days)
     */
    public function scopeRecent(Builder $query): Builder
    {
        return $query->where('created_at', '>=', now()->subDays(30));
    }

    /**
     * Scope for critical activities
     */
    public function scopeCritical(Builder $query): Builder
    {
        return $query->where('level', self::LEVEL_CRITICAL);
    }

    /**
     * Create a new activity log entry
     */
    public static function log(array $data): self
    {
        return self::create([
            'user_id' => $data['user_id'] ?? null,
            'action' => $data['action'],
            'entity_type' => $data['entity_type'] ?? null,
            'entity_id' => $data['entity_id'] ?? null,
            'old_values' => $data['old_values'] ?? null,
            'new_values' => $data['new_values'] ?? null,
            'description' => $data['description'],
            'ip_address' => $data['ip_address'] ?? request()?->ip(),
            'user_agent' => $data['user_agent'] ?? request()?->userAgent(),
            'level' => $data['level'] ?? self::LEVEL_INFO,
            'metadata' => $data['metadata'] ?? null,
        ]);
    }

    /**
     * Get human-readable action text in Bulgarian
     */
    public function getActionTextAttribute(): string
    {
        $actions = [
            self::ACTION_CREATED => 'създаде',
            self::ACTION_UPDATED => 'обнови',
            self::ACTION_DELETED => 'изтри',
            self::ACTION_APPROVED => 'одобри',
            self::ACTION_REJECTED => 'отказа',
            self::ACTION_LOGIN => 'влезе в системата',
            self::ACTION_LOGOUT => 'излезе от системата',
            self::ACTION_2FA_ENABLED => 'активира 2FA',
            self::ACTION_2FA_DISABLED => 'деактивира 2FA',
            self::ACTION_PROFILE_ACTIVATED => 'активира профила си',
        ];

        return $actions[$this->action] ?? $this->action;
    }

    /**
     * Get level color for UI
     */
    public function getLevelColorAttribute(): string
    {
        return match($this->level) {
            self::LEVEL_CRITICAL => 'red',
            self::LEVEL_WARNING => 'yellow',
            default => 'blue',
        };
    }
}
