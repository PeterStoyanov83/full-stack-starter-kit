<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'profile_status',
        'profile_activated_at',
        'requires_2fa_setup',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'profile_activated_at' => 'datetime',
            'requires_2fa_setup' => 'boolean',
            'password' => 'hashed',
        ];
    }

    /**
     * Get all tools created by this user
     */
    public function createdTools(): HasMany
    {
        return $this->hasMany(Tool::class, 'user_id');
    }

    /**
     * Get tools recommended for this user's role (many-to-many)
     */
    public function recommendedTools(): BelongsToMany
    {
        return $this->belongsToMany(Tool::class)
                    ->withPivot('role_type', 'notes')
                    ->withTimestamps();
    }

    /**
     * Get all 2FA settings for this user
     */
    public function twoFactorAuth(): HasMany
    {
        return $this->hasMany(\App\Models\TwoFactorAuth::class);
    }

    /**
     * Get enabled 2FA methods for this user
     */
    public function enabledTwoFactorAuth(): HasMany
    {
        return $this->hasMany(\App\Models\TwoFactorAuth::class)->enabled();
    }

    /**
     * Check if user has any 2FA method enabled
     */
    public function hasTwoFactorEnabled(): bool
    {
        return $this->enabledTwoFactorAuth()->exists();
    }

    /**
     * Get the primary (first enabled) 2FA method for this user
     */
    public function primaryTwoFactorMethod(): ?\App\Models\TwoFactorAuth
    {
        return $this->enabledTwoFactorAuth()->first();
    }

    /**
     * Scope a query to filter users by role
     */
    public function scopeByRole($query, $role)
    {
        return $query->where('role', $role);
    }

    /**
     * Check if user profile is active
     */
    public function isProfileActive(): bool
    {
        return $this->profile_status === 'active';
    }

    /**
     * Check if user needs to set up 2FA
     */
    public function needsTwoFactorSetup(): bool
    {
        return $this->requires_2fa_setup && !$this->hasTwoFactorEnabled();
    }

    /**
     * Activate user profile after 2FA setup
     */
    public function activateProfile(): void
    {
        $this->update([
            'profile_status' => 'active',
            'profile_activated_at' => now(),
            'requires_2fa_setup' => false,
        ]);
    }
}
