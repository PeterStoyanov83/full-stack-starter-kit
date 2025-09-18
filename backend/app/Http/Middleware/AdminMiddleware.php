<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Нужна е автентикация'
            ], 401);
        }

        // Check if user is owner (admin)
        if ($user->role !== 'owner') {
            return response()->json([
                'message' => 'Нужни са администраторски права'
            ], 403);
        }

        return $next($request);
    }
}