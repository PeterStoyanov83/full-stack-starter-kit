<?php

namespace App\Services\TwoFactor;

use App\Models\User;
use App\Models\TwoFactorAuth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramService implements TwoFactorServiceInterface
{
    private string $botToken;
    private string $botUsername;

    public function __construct()
    {
        $this->botToken = config('services.telegram.bot_token', '');
        $this->botUsername = config('services.telegram.bot_username', '');
    }

    /**
     * Setup Telegram 2FA for a user
     */
    public function setup(User $user, array $data = []): array
    {
        // Create or update 2FA record
        $twoFactorAuth = TwoFactorAuth::updateOrCreate(
            [
                'user_id' => $user->id,
                'method' => TwoFactorAuth::METHOD_TELEGRAM
            ],
            [
                'is_enabled' => false, // Will be enabled after verification
                'failed_attempts' => 0,
                'locked_until' => null
            ]
        );

        // Generate setup token for user to send to bot
        $setupToken = 'SETUP_' . $user->id . '_' . bin2hex(random_bytes(8));
        Cache::put("telegram_setup_{$user->id}", $setupToken, now()->addMinutes(10));

        return [
            'bot_username' => $this->botUsername,
            'setup_token' => $setupToken,
            'deep_link' => "https://t.me/{$this->botUsername}?start={$setupToken}",
            'backup_codes' => $twoFactorAuth->generateBackupCodes()
        ];
    }

    /**
     * Send verification code via Telegram
     */
    public function sendCode(TwoFactorAuth $twoFactorAuth): bool
    {
        if ($twoFactorAuth->isLocked() || !$twoFactorAuth->telegram_chat_id) {
            return false;
        }

        // Generate 6-digit code
        $code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

        // Store code in cache for 5 minutes
        $cacheKey = "telegram_2fa_code_{$twoFactorAuth->user_id}";
        Cache::put($cacheKey, $code, now()->addMinutes(5));

        try {
            $message = "🔐 Код за двуфакторна автентикация: `{$code}`\n\n" .
                      "Кодът е валиден 5 минути.\n" .
                      "Ако не сте заявили този код, моля игнорирайте го.";

            $response = Http::post("https://api.telegram.org/bot{$this->botToken}/sendMessage", [
                'chat_id' => $twoFactorAuth->telegram_chat_id,
                'text' => $message,
                'parse_mode' => 'Markdown'
            ]);

            if ($response->successful()) {
                Log::info("2FA Telegram code sent to user {$twoFactorAuth->user_id}");
                return true;
            }

            Log::error("Failed to send Telegram 2FA code", [
                'user_id' => $twoFactorAuth->user_id,
                'response' => $response->body()
            ]);

        } catch (\Exception $e) {
            Log::error("Telegram 2FA code send exception: " . $e->getMessage());
        }

        return false;
    }

    /**
     * Verify Telegram code
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

        // Check cached Telegram code
        $cacheKey = "telegram_2fa_code_{$twoFactorAuth->user_id}";
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
            'method' => 'Telegram бот',
            'instructions' => [
                '1. Отворете Telegram и намерете бота @' . $this->botUsername,
                '2. Изпратете команда /start с токена за настройка',
                '3. Потвърдете връзката с акаунта си',
                '4. При всеки вход ще получавате код в Telegram'
            ],
            'requirements' => [
                'Telegram акаунт',
                'Мобилно приложение или десктоп версия',
                'Достъп до интернет'
            ]
        ];
    }

    /**
     * Check if Telegram 2FA is available
     */
    public function isAvailable(): bool
    {
        return !empty($this->botToken) && !empty($this->botUsername);
    }

    /**
     * Verify setup token and link chat ID to user
     */
    public function verifySetupToken(string $setupToken, string $chatId): ?TwoFactorAuth
    {
        // Extract user ID from setup token
        if (!str_starts_with($setupToken, 'SETUP_')) {
            return null;
        }

        $parts = explode('_', $setupToken);
        if (count($parts) < 3) {
            return null;
        }

        $userId = $parts[1];

        // Check if token is valid
        $cachedToken = Cache::get("telegram_setup_{$userId}");
        if ($cachedToken !== $setupToken) {
            return null;
        }

        // Update 2FA record with chat ID
        $twoFactorAuth = TwoFactorAuth::where('user_id', $userId)
            ->where('method', TwoFactorAuth::METHOD_TELEGRAM)
            ->first();

        if ($twoFactorAuth) {
            $twoFactorAuth->update(['telegram_chat_id' => $chatId]);
            Cache::forget("telegram_setup_{$userId}");
            return $twoFactorAuth;
        }

        return null;
    }

    /**
     * Send welcome message to user
     */
    public function sendWelcomeMessage(string $chatId, User $user): bool
    {
        try {
            $message = "🎉 Здравейте, {$user->name}!\n\n" .
                      "Вашият Telegram акаунт е успешно свързан с " . config('app.name') . ".\n" .
                      "Сега ще получавате кодове за двуфакторна автентикация тук.\n\n" .
                      "Команди:\n" .
                      "/help - Помощ\n" .
                      "/status - Статус на връзката";

            $response = Http::post("https://api.telegram.org/bot{$this->botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $message,
                'parse_mode' => 'Markdown'
            ]);

            return $response->successful();

        } catch (\Exception $e) {
            Log::error("Failed to send Telegram welcome message: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Handle Telegram webhook (for bot setup)
     */
    public function handleWebhook(array $update): void
    {
        if (isset($update['message'])) {
            $message = $update['message'];
            $chatId = $message['chat']['id'];
            $text = $message['text'] ?? '';

            // Handle /start command with setup token
            if (str_starts_with($text, '/start SETUP_')) {
                $setupToken = str_replace('/start ', '', $text);
                $twoFactorAuth = $this->verifySetupToken($setupToken, $chatId);

                if ($twoFactorAuth) {
                    $this->sendWelcomeMessage($chatId, $twoFactorAuth->user);
                } else {
                    Http::post("https://api.telegram.org/bot{$this->botToken}/sendMessage", [
                        'chat_id' => $chatId,
                        'text' => "❌ Невалиден токен за настройка. Моля, опитайте отново."
                    ]);
                }
            }
        }
    }
}