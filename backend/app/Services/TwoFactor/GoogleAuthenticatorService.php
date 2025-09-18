<?php

namespace App\Services\TwoFactor;

use App\Models\User;
use App\Models\TwoFactorAuth;
use PragmaRX\Google2FA\Google2FA;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Cache;

class GoogleAuthenticatorService implements TwoFactorServiceInterface
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Setup Google Authenticator for a user
     */
    public function setup(User $user, array $data = []): array
    {
        // Generate secret key
        $secretKey = $this->google2fa->generateSecretKey(32);

        // Create or update 2FA record
        $twoFactorAuth = TwoFactorAuth::updateOrCreate(
            [
                'user_id' => $user->id,
                'method' => TwoFactorAuth::METHOD_GOOGLE_AUTHENTICATOR
            ],
            [
                'secret_key' => $secretKey,
                'is_enabled' => false, // Will be enabled after verification
                'failed_attempts' => 0,
                'locked_until' => null
            ]
        );

        // Generate QR code URL
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secretKey
        );

        // Generate base64 encoded QR code image
        $qrCodeImage = 'data:image/svg+xml;base64,' . base64_encode(
            QrCode::size(200)->generate($qrCodeUrl)
        );

        return [
            'secret_key' => $secretKey,
            'qr_code_url' => $qrCodeImage,
            'manual_entry_key' => chunk_split($secretKey, 4, ' '),
            'backup_codes' => $twoFactorAuth->generateBackupCodes()
        ];
    }

    /**
     * Send verification code (not applicable for Google Authenticator)
     */
    public function sendCode(TwoFactorAuth $twoFactorAuth): bool
    {
        // Google Authenticator doesn't send codes, user generates them
        return true;
    }

    /**
     * Verify Google Authenticator code
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

        // Verify TOTP code
        $isValid = $this->google2fa->verifyKey(
            $twoFactorAuth->secret_key,
            $code,
            2 // Allow 2 time windows (60 seconds each)
        );

        if ($isValid) {
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
            'method' => 'Google Authenticator',
            'instructions' => [
                '1. Инсталирайте Google Authenticator на телефона си',
                '2. Сканирайте QR кода или въведете ключа ръчно',
                '3. Въведете 6-цифрения код за потвърждение',
                '4. Запазете резервните кодове на сигурно място'
            ],
            'requirements' => [
                'Смартфон с Android или iOS',
                'Google Authenticator приложение',
                'Достъп до QR код сканер'
            ]
        ];
    }

    /**
     * Check if Google Authenticator is available
     */
    public function isAvailable(): bool
    {
        return class_exists('PragmaRX\Google2FA\Google2FA');
    }

    /**
     * Generate QR code for existing setup
     */
    public function generateQRCode(TwoFactorAuth $twoFactorAuth): string
    {
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $twoFactorAuth->user->email,
            $twoFactorAuth->secret_key
        );

        // Generate base64 encoded QR code image
        return 'data:image/svg+xml;base64,' . base64_encode(
            QrCode::size(200)->generate($qrCodeUrl)
        );
    }
}