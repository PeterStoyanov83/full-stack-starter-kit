<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\TwoFactor\TwoFactorManager;
use App\Services\ActivityLogService;
use App\Models\TwoFactorAuth;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class TwoFactorController extends Controller
{
    private TwoFactorManager $twoFactorManager;

    public function __construct(TwoFactorManager $twoFactorManager)
    {
        $this->twoFactorManager = $twoFactorManager;
    }

    /**
     * Get user's 2FA status and available methods
     */
    public function status(Request $request): JsonResponse
    {
        $status = $this->twoFactorManager->getUserStatus($request->user());

        return response()->json($status);
    }

    /**
     * Get available 2FA methods
     */
    public function methods(): JsonResponse
    {
        $methods = $this->twoFactorManager->getAvailableMethods();

        return response()->json([
            'methods' => $methods
        ]);
    }

    /**
     * Setup 2FA method for user
     */
    public function setup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method' => 'required|in:google_authenticator,email,telegram'
        ]);

        try {
            $setupData = $this->twoFactorManager->setup(
                $request->user(),
                $validated['method']
            );

            return response()->json([
                'message' => 'Настройката на двуфакторната автентикация е започната',
                'data' => $setupData
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при настройване на двуфакторната автентикация',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Enable 2FA method after verification
     */
    public function enable(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method' => 'required|in:google_authenticator,email,telegram',
            'code' => 'required|string|min:6|max:8'
        ]);

        // Check if 2FA record exists for this user and method
        $twoFactorAuth = \App\Models\TwoFactorAuth::where('user_id', $request->user()->id)
            ->where('method', $validated['method'])
            ->first();

        if (!$twoFactorAuth) {
            return response()->json([
                'message' => 'Първо трябва да настроите двуфакторната автентикация'
            ], 422);
        }

        $success = $this->twoFactorManager->enable(
            $request->user(),
            $validated['method'],
            $validated['code']
        );

        if ($success) {
            return response()->json([
                'message' => 'Двуфакторната автентикация е активирана успешно'
            ]);
        }

        return response()->json([
            'message' => 'Невалиден код за потвърждение'
        ], 422);
    }

    /**
     * Disable 2FA method
     */
    public function disable(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method' => 'required|in:google_authenticator,email,telegram'
        ]);

        $success = $this->twoFactorManager->disable(
            $request->user(),
            $validated['method']
        );

        if ($success) {
            return response()->json([
                'message' => 'Двуфакторната автентикация е деактивирана'
            ]);
        }

        return response()->json([
            'message' => 'Грешка при деактивиране на двуфакторната автентикация'
        ], 422);
    }

    /**
     * Send verification code
     */
    public function sendCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method' => 'nullable|in:google_authenticator,email,telegram'
        ]);

        $success = $this->twoFactorManager->sendVerificationCode(
            $request->user(),
            $validated['method'] ?? null
        );

        if ($success) {
            return response()->json([
                'message' => 'Кодът за потвърждение е изпратен'
            ]);
        }

        return response()->json([
            'message' => 'Грешка при изпращане на код за потвърждение'
        ], 422);
    }

    /**
     * Verify 2FA code and automatically enable if successful
     */
    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|min:6|max:8',
            'method' => 'nullable|in:google_authenticator,email,telegram'
        ]);

        // Get the method from request or find the setup method for the user
        $method = $validated['method'];
        if (!$method) {
            $twoFactorAuth = \App\Models\TwoFactorAuth::where('user_id', $request->user()->id)
                ->where('is_enabled', false)
                ->first();

            if ($twoFactorAuth) {
                $method = $twoFactorAuth->method;
            }
        }

        if (!$method) {
            return response()->json([
                'message' => 'Няма настроена двуфакторна автентикация',
                'verified' => false
            ], 422);
        }

        // Verify and enable in one step
        $success = $this->twoFactorManager->enable(
            $request->user(),
            $method,
            $validated['code']
        );

        if ($success) {
            // Activate user profile if this is their first 2FA setup
            $user = $request->user();
            $wasFirstSetup = $user->needsTwoFactorSetup();

            if ($wasFirstSetup) {
                $user->activateProfile();
                ActivityLogService::logProfileActivated($user);
            }

            // Log 2FA activation
            ActivityLogService::log2FAEnabled($user, $method);

            return response()->json([
                'message' => 'Двуфакторната автентикация е активирана успешно',
                'verified' => true,
                'enabled' => true,
                'profile_activated' => $user->fresh()->isProfileActive()
            ]);
        }

        return response()->json([
            'message' => 'Невалиден код за потвърждение',
            'verified' => false
        ], 422);
    }

    /**
     * Get QR code for Google Authenticator
     */
    public function qrCode(Request $request): JsonResponse
    {
        $twoFactorAuth = TwoFactorAuth::where('user_id', $request->user()->id)
            ->where('method', TwoFactorAuth::METHOD_GOOGLE_AUTHENTICATOR)
            ->first();

        if (!$twoFactorAuth) {
            return response()->json([
                'message' => 'Google Authenticator не е настроен'
            ], 404);
        }

        try {
            $service = $this->twoFactorManager->getService(TwoFactorAuth::METHOD_GOOGLE_AUTHENTICATOR);
            $qrCodeUrl = $service->generateQRCode($twoFactorAuth);

            return response()->json([
                'qr_code_url' => $qrCodeUrl,
                'manual_entry_key' => chunk_split($twoFactorAuth->secret_key, 4, ' ')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при генериране на QR код',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate new backup codes
     */
    public function generateBackupCodes(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method' => 'required|in:google_authenticator,email,telegram'
        ]);

        $twoFactorAuth = TwoFactorAuth::where('user_id', $request->user()->id)
            ->where('method', $validated['method'])
            ->first();

        if (!$twoFactorAuth) {
            return response()->json([
                'message' => 'Двуфакторната автентикация не е настроена за този метод'
            ], 404);
        }

        $backupCodes = $twoFactorAuth->generateBackupCodes();

        return response()->json([
            'message' => 'Нови резервни кодове са генерирани',
            'backup_codes' => $backupCodes
        ]);
    }

    /**
     * Get setup instructions for a method
     */
    public function instructions(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'method' => 'required|in:google_authenticator,email,telegram'
        ]);

        try {
            $service = $this->twoFactorManager->getService($validated['method']);

            // Create a temporary 2FA record to get instructions
            $tempTwoFactorAuth = new TwoFactorAuth([
                'method' => $validated['method'],
                'user_id' => $request->user()->id
            ]);
            $tempTwoFactorAuth->user = $request->user();

            $instructions = $service->getSetupInstructions($tempTwoFactorAuth);

            return response()->json($instructions);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при получаване на инструкции',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}