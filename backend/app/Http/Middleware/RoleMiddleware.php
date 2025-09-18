<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Нужна е автентикация'
            ], 401);
        }

        // Convert roles to array if passed as string
        if (is_string($roles[0]) && str_contains($roles[0], '|')) {
            $roles = explode('|', $roles[0]);
        }

        // Check if user has any of the required roles
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'message' => 'Нямате достъп до този ресурс'
            ], 403);
        }

        return $next($request);
    }
}