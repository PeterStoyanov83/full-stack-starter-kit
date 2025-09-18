<?php

namespace App\Services\TwoFactor;

use App\Models\User;
use App\Models\TwoFactorAuth;
use InvalidArgumentException;

class TwoFactorManager
{
    private array $services = [];

    public function __construct(
        GoogleAuthenticatorService $googleAuthenticator,
        EmailService $email,
        TelegramService $telegram
    ) {
        $this->services = [
            TwoFactorAuth::METHOD_GOOGLE_AUTHENTICATOR => $googleAuthenticator,
            TwoFactorAuth::METHOD_EMAIL => $email,
            TwoFactorAuth::METHOD_TELEGRAM => $telegram,
        ];
    }

    /**
     * Get service for specific 2FA method
     */
    public function getService(string $method): TwoFactorServiceInterface
    {
        if (!isset($this->services[$method])) {
            throw new InvalidArgumentException("Unknown 2FA method: {$method}");
        }

        return $this->services[$method];
    }

    /**
     * Get all available 2FA methods
     */
    public function getAvailableMethods(): array
    {
        $methods = [];

        foreach ($this->services as $method => $service) {
            if ($service->isAvailable()) {
                $methods[] = [
                    'method' => $method,
                    'name' => $this->getMethodDisplayName($method),
                    'description' => $this->getMethodDescription($method),
                    'icon' => $this->getMethodIcon($method)
                ];
            }
        }

        return $methods;
    }

    /**
     * Setup 2FA for user with specific method
     */
    public function setup(User $user, string $method, array $data = []): array
    {
        $service = $this->getService($method);
        return $service->setup($user, $data);
    }

    /**
     * Enable 2FA method for user after verification
     */
    public function enable(User $user, string $method, string $verificationCode): bool
    {
        $twoFactorAuth = TwoFactorAuth::where('user_id', $user->id)
            ->where('method', $method)
            ->first();

        if (!$twoFactorAuth) {
            return false;
        }

        $service = $this->getService($method);

        if ($service->verifyCode($twoFactorAuth, $verificationCode)) {
            $twoFactorAuth->update(['is_enabled' => true]);
            return true;
        }

        return false;
    }

    /**
     * Disable 2FA method for user
     */
    public function disable(User $user, string $method): bool
    {
        $twoFactorAuth = TwoFactorAuth::where('user_id', $user->id)
            ->where('method', $method)
            ->first();

        if ($twoFactorAuth) {
            $twoFactorAuth->update(['is_enabled' => false]);
            return true;
        }

        return false;
    }

    /**
     * Send verification code for enabled 2FA method
     */
    public function sendVerificationCode(User $user, string $method = null): bool
    {
        // If no method specified, use primary enabled method
        if (!$method) {
            $twoFactorAuth = $user->primaryTwoFactorMethod();
        } else {
            $twoFactorAuth = TwoFactorAuth::where('user_id', $user->id)
                ->where('method', $method)
                ->enabled()
                ->first();
        }

        if (!$twoFactorAuth) {
            return false;
        }

        $service = $this->getService($twoFactorAuth->method);
        return $service->sendCode($twoFactorAuth);
    }

    /**
     * Verify 2FA code for user
     */
    public function verifyUserCode(User $user, string $code, string $method = null): bool
    {
        // If no method specified, try all enabled methods
        if (!$method) {
            $twoFactorMethods = $user->enabledTwoFactorAuth;
        } else {
            $twoFactorMethods = TwoFactorAuth::where('user_id', $user->id)
                ->where('method', $method)
                ->enabled()
                ->get();
        }

        foreach ($twoFactorMethods as $twoFactorAuth) {
            $service = $this->getService($twoFactorAuth->method);

            if ($service->verifyCode($twoFactorAuth, $code)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Get user's 2FA status
     */
    public function getUserStatus(User $user): array
    {
        $enabledMethods = $user->enabledTwoFactorAuth->map(function ($tfa) {
            return [
                'method' => $tfa->method,
                'name' => $this->getMethodDisplayName($tfa->method),
                'is_setup_complete' => $tfa->isSetupComplete(),
                'last_used_at' => $tfa->last_used_at,
                'backup_codes_count' => count($tfa->getAvailableBackupCodes())
            ];
        });

        return [
            'is_enabled' => $user->hasTwoFactorEnabled(),
            'enabled_methods' => $enabledMethods,
            'available_methods' => $this->getAvailableMethods()
        ];
    }

    /**
     * Get display name for method
     */
    private function getMethodDisplayName(string $method): string
    {
        return match($method) {
            TwoFactorAuth::METHOD_GOOGLE_AUTHENTICATOR => 'Google Authenticator',
            TwoFactorAuth::METHOD_EMAIL => 'Имейл код',
            TwoFactorAuth::METHOD_TELEGRAM => 'Telegram бот',
            default => $method
        };
    }

    /**
     * Get description for method
     */
    private function getMethodDescription(string $method): string
    {
        return match($method) {
            TwoFactorAuth::METHOD_GOOGLE_AUTHENTICATOR => 'Използвайте Google Authenticator приложението за генериране на кодове',
            TwoFactorAuth::METHOD_EMAIL => 'Получавайте кодове за двуфакторна автентикация на имейла си',
            TwoFactorAuth::METHOD_TELEGRAM => 'Получавайте кодове чрез Telegram бот',
            default => ''
        };
    }

    /**
     * Get icon for method
     */
    private function getMethodIcon(string $method): string
    {
        return match($method) {
            TwoFactorAuth::METHOD_GOOGLE_AUTHENTICATOR => 'smartphone',
            TwoFactorAuth::METHOD_EMAIL => 'mail',
            TwoFactorAuth::METHOD_TELEGRAM => 'message-circle',
            default => 'shield'
        };
    }
}