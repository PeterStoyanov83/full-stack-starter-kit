<?php

namespace App\Services\TwoFactor;

use App\Models\User;
use App\Models\TwoFactorAuth;

interface TwoFactorServiceInterface
{
    /**
     * Setup 2FA for a user
     */
    public function setup(User $user, array $data = []): array;

    /**
     * Send verification code to user
     */
    public function sendCode(TwoFactorAuth $twoFactorAuth): bool;

    /**
     * Verify the provided code
     */
    public function verifyCode(TwoFactorAuth $twoFactorAuth, string $code): bool;

    /**
     * Get setup instructions for the user
     */
    public function getSetupInstructions(TwoFactorAuth $twoFactorAuth): array;

    /**
     * Check if this 2FA method is available for setup
     */
    public function isAvailable(): bool;
}