<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Handle user login and generate API token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Грешен имейл или парола.'],
            ]);
        }

        // Create API token for the user
        $token = $user->createToken('auth-token')->plainTextToken;

        // Log the login activity
        ActivityLogService::logLogin($user);

        return response()->json([
            'message' => 'Успешен вход в системата',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_status' => $user->profile_status,
                'requires_2fa_setup' => $user->needsTwoFactorSetup(),
                'has_2fa_enabled' => $user->hasTwoFactorEnabled(),
            ],
            'token' => $token,
            'requires_2fa_setup' => $user->needsTwoFactorSetup(),
        ]);
    }

    /**
     * Handle user logout and revoke API token
     */
    public function logout(Request $request)
    {
        $user = $request->user();

        // Log the logout activity before deleting the token
        ActivityLogService::logLogout($user);

        $user->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Успешен изход от системата',
        ]);
    }
}
