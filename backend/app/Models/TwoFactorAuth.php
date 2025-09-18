<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class TwoFactorAuth extends Model
{
    use HasFactory;

    protected $table = 'user_two_factor_auth';

    protected $fillable = [
        'user_id',
        'method',
        'is_enabled',
        'secret_key',
        'telegram_chat_id',
        'backup_codes',
        'last_used_at',
        'failed_attempts',
        'locked_until',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
        'backup_codes' => 'array',
        'last_used_at' => 'datetime',
        'locked_until' => 'datetime',
    ];

    /**
     * 2FA method constants
     */
    const METHOD_GOOGLE_AUTHENTICATOR = 'google_authenticator';
    const METHOD_EMAIL = 'email';
    const METHOD_TELEGRAM = 'telegram';

    /**
     * Maximum failed attempts before lockout
     */
    const MAX_FAILED_ATTEMPTS = 3;

    /**
     * Lockout duration in minutes
     */
    const LOCKOUT_DURATION = 15;

    /**
     * Get the user that owns the 2FA setting
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if this 2FA method is currently locked due to failed attempts
     */
    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    /**
     * Increment failed attempts and lock if necessary
     */
    public function incrementFailedAttempts(): void
    {
        $this->increment('failed_attempts');

        if ($this->failed_attempts >= self::MAX_FAILED_ATTEMPTS) {
            $this->update([
                'locked_until' => now()->addMinutes(self::LOCKOUT_DURATION)
            ]);
        }
    }

    /**
     * Reset failed attempts (called on successful verification)
     */
    public function resetFailedAttempts(): void
    {
        $this->update([
            'failed_attempts' => 0,
            'locked_until' => null,
            'last_used_at' => now()
        ]);
    }

    /**
     * Generate backup codes
     */
    public function generateBackupCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 8));
        }

        $this->update(['backup_codes' => $codes]);
        return $codes;
    }

    /**
     * Use a backup code (marks it as used)
     */
    public function useBackupCode(string $code): bool
    {
        $codes = $this->backup_codes ?? [];
        $codeIndex = array_search(strtoupper($code), $codes);

        if ($codeIndex !== false) {
            // Mark code as used by prefixing with 'USED_'
            $codes[$codeIndex] = 'USED_' . $codes[$codeIndex];
            $this->update(['backup_codes' => $codes]);
            $this->resetFailedAttempts();
            return true;
        }

        return false;
    }

    /**
     * Get available (unused) backup codes
     */
    public function getAvailableBackupCodes(): array
    {
        $codes = $this->backup_codes ?? [];
        return array_filter($codes, function($code) {
            return !str_starts_with($code, 'USED_');
        });
    }

    /**
     * Scope to get enabled 2FA methods for a user
     */
    public function scopeEnabled($query)
    {
        return $query->where('is_enabled', true);
    }

    /**
     * Scope to get by method
     */
    public function scopeByMethod($query, string $method)
    {
        return $query->where('method', $method);
    }

    /**
     * Get display name for 2FA method
     */
    public function getMethodDisplayName(): string
    {
        return match($this->method) {
            self::METHOD_GOOGLE_AUTHENTICATOR => 'Google Authenticator',
            self::METHOD_EMAIL => 'Имейл код',
            self::METHOD_TELEGRAM => 'Telegram бот',
            default => $this->method
        };
    }

    /**
     * Check if method requires setup (has necessary credentials)
     */
    public function isSetupComplete(): bool
    {
        return match($this->method) {
            self::METHOD_GOOGLE_AUTHENTICATOR => !empty($this->secret_key),
            self::METHOD_EMAIL => true, // Email is always available
            self::METHOD_TELEGRAM => !empty($this->telegram_chat_id),
            default => false
        };
    }
}