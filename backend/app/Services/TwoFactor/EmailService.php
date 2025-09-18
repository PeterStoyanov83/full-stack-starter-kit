<?php

namespace App\Services\TwoFactor;

use App\Models\User;
use App\Models\TwoFactorAuth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class EmailService implements TwoFactorServiceInterface
{
    /**
     * Setup Email 2FA for a user
     */
    public function setup(User $user, array $data = []): array
    {
        // Create or update 2FA record
        $twoFactorAuth = TwoFactorAuth::updateOrCreate(
            [
                'user_id' => $user->id,
                'method' => TwoFactorAuth::METHOD_EMAIL
            ],
            [
                'is_enabled' => false, // Will be enabled after verification
                'failed_attempts' => 0,
                'locked_until' => null
            ]
        );

        return [
            'email' => $user->email,
            'backup_codes' => $twoFactorAuth->generateBackupCodes()
        ];
    }

    /**
     * Send verification code via email
     */
    public function sendCode(TwoFactorAuth $twoFactorAuth): bool
    {
        if ($twoFactorAuth->isLocked()) {
            return false;
        }

        // Generate 6-digit code
        $code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Store code in cache for 5 minutes
        $cacheKey = "email_2fa_code_{$twoFactorAuth->user_id}";
        Cache::put($cacheKey, $code, now()->addMinutes(5));

        try {
            // Send email (simplified - in production you'd use a proper email template)
            $user = $twoFactorAuth->user;

            Mail::raw(
                "Вашият код за двуфакторна автентикация е: {$code}\n\n" .
                "Кодът е валиден 5 минути.\n\n" .
                "Ако не сте заявили този код, моля игнорирайте този имейл.",
                function ($message) use ($user) {
                    $message->to($user->email)
                           ->subject('Код за двуфакторна автентикация - ' . config('app.name'));
                }
            );

            Log::info("2FA email code sent to user {$user->id}");
            return true;

        } catch (\Exception $e) {
            Log::error("Failed to send 2FA email code: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Verify email code
     */
    public function verifyCode(TwoFactorAuth $twoFactorAuth, string $code): bool
    {
        if ($twoFactorAuth->isLocked()) {
            return false;
        }

        // Check if it's a backup code
        if (strlen($code) === 8 && $twoFactorAuth->useBackupCode($code)) {
            return true;
        }

        // Check cached email code
        $cacheKey = "email_2fa_code_{$twoFactorAuth->user_id}";
        $storedCode = Cache::get($cacheKey);

        if ($storedCode && $storedCode === $code) {
            // Remove used code from cache
            Cache::forget($cacheKey);
            $twoFactorAuth->resetFailedAttempts();
            return true;
        }

        $twoFactorAuth->incrementFailedAttempts();
        return false;
    }

    /**
     * Get setup instructions
     */
    public function getSetupInstructions(TwoFactorAuth $twoFactorAuth): array
    {
        return [
            'method' => 'Имейл код',
            'instructions' => [
                '1. При всеки вход ще получавате код на имейла си',
                '2. Въведете 6-цифрения код в полето за потвърждение',
                '3. Кодът е валиден 5 минути',
                '4. Запазете резервните кодове за аварийен достъп'
            ],
            'requirements' => [
                'Достъп до имейл акаунта си',
                'Стабилна интернет връзка',
                'Проверете SPAM папката при проблеми'
            ]
        ];
    }

    /**
     * Check if email 2FA is available
     */
    public function isAvailable(): bool
    {
        return config('mail.default') !== null;
    }

    /**
     * Get the email address for this 2FA setup
     */
    public function getEmailAddress(TwoFactorAuth $twoFactorAuth): string
    {
        return $twoFactorAuth->user->email;
    }

    /**
     * Resend code (with rate limiting)
     */
    public function resendCode(TwoFactorAuth $twoFactorAuth): bool
    {
        $rateLimitKey = "email_2fa_resend_{$twoFactorAuth->user_id}";

        if (Cache::has($rateLimitKey)) {
            return false; // Rate limited
        }

        // Allow resend once per minute
        Cache::put($rateLimitKey, true, now()->addMinute());

        return $this->sendCode($twoFactorAuth);
    }
}