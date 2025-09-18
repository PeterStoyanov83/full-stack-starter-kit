<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Display a listing of users (Admin only)
     */
    public function index(Request $request): JsonResponse
    {
        $users = User::with('createdTools')
            ->withCount('createdTools')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'is_active' => true, // You might want to add an is_active column
                    'created_at' => $user->created_at->toISOString(),
                    'updated_at' => $user->updated_at->toISOString(),
                    'email_verified_at' => $user->email_verified_at?->toISOString(),
                    'tools_count' => $user->created_tools_count
                ];
            });

        return response()->json([
            'data' => $users,
            'total' => $users->count()
        ]);
    }

    /**
     * Store a newly created user (Admin only)
     */
    public function store(Request $request): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can create users.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:owner,frontend,backend,pm,qa,designer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'email_verified_at' => now() // Auto-verify admin-created users
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => true,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'tools_count' => 0
            ]
        ], 201);
    }

    /**
     * Display the specified user
     */
    public function show(Request $request, User $user): JsonResponse
    {
        // Check if user is owner or requesting their own data
        if ($request->user()->role !== 'owner' && $request->user()->id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 403);
        }

        $user->loadCount('createdTools');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'is_active' => true,
            'created_at' => $user->created_at->toISOString(),
            'updated_at' => $user->updated_at->toISOString(),
            'email_verified_at' => $user->email_verified_at?->toISOString(),
            'tools_count' => $user->created_tools_count
        ]);
    }

    /**
     * Update the specified user (Admin only)
     */
    public function update(Request $request, User $user): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can update users.'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => [
                'sometimes',
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users')->ignore($user->id)
            ],
            'password' => 'sometimes|nullable|string|min:8',
            'role' => 'sometimes|required|string|in:owner,frontend,backend,pm,qa,designer'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['name', 'email', 'role']);

        // Only update password if provided
        if ($request->filled('password')) {
            $updateData['password'] = Hash::make($request->password);
        }

        $user->update($updateData);
        $user->loadCount('createdTools');

        return response()->json([
            'message' => 'User updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'is_active' => true,
                'created_at' => $user->created_at->toISOString(),
                'updated_at' => $user->updated_at->toISOString(),
                'email_verified_at' => $user->email_verified_at?->toISOString(),
                'tools_count' => $user->created_tools_count
            ]
        ]);
    }

    /**
     * Remove the specified user (Admin only)
     */
    public function destroy(Request $request, User $user): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can delete users.'
            ], 403);
        }

        // Prevent deleting self
        if ($request->user()->id === $user->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.'
            ], 422);
        }

        // Prevent deleting other owners (optional security measure)
        if ($user->role === 'owner') {
            return response()->json([
                'message' => 'Cannot delete other owner accounts.'
            ], 422);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Get system statistics (Admin only)
     */
    public function stats(Request $request): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Unauthorized. Only owners can view statistics.'
            ], 403);
        }

        $totalUsers = User::count();
        $activeUsers = $totalUsers; // Since we don't have is_active yet
        $totalTools = \App\Models\Tool::count();
        $activeTools = \App\Models\Tool::where('is_active', true)->count();

        $toolsThisMonth = \App\Models\Tool::whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $categoriesCount = \App\Models\Category::count();
        $tagsCount = \App\Models\Tag::count();

        return response()->json([
            'total_users' => $totalUsers,
            'active_users' => $activeUsers,
            'total_tools' => $totalTools,
            'active_tools' => $activeTools,
            'tools_this_month' => $toolsThisMonth,
            'categories_count' => $categoriesCount,
            'tags_count' => $tagsCount
        ]);
    }
}