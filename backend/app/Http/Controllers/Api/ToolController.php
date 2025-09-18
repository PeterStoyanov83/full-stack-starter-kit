<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\Category;
use App\Models\Tag;
use App\Services\CacheService;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;

class ToolController extends Controller
{
    /**
     * Display a listing of tools with filtering and search
     */
    public function index(Request $request): JsonResponse
    {
        $query = Tool::with(['category', 'creator', 'tags', 'recommendedUsers', 'approver'])
                     ->active();

        // For non-owners, only show approved tools
        if ($request->user()->role !== 'owner') {
            $query->approved();
        }

        // If owner is requesting, allow status filtering
        if ($request->user()->role === 'owner' && $request->has('status')) {
            $query->byStatus($request->status);
        }

        // Search by name or description
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->byCategory($request->category_id);
        }

        // Filter by tags
        if ($request->has('tags') && is_array($request->tags)) {
            $query->byTags($request->tags);
        }

        // Filter by role (check recommended users)
        if ($request->has('role') && $request->role) {
            $query->whereHas('recommendedUsers', function ($q) use ($request) {
                $q->where('role', $request->role);
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $tools = $query->latest()->paginate($perPage);

        return response()->json($tools);
    }

    /**
     * Store a newly created tool
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'link' => 'required|string|max:255',
            'description' => 'required|string',
            'documentation' => 'nullable|string',
            'usage_instructions' => 'nullable|string',
            'examples' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string', // Image URLs or paths
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'recommended_roles' => 'nullable|array',
            'recommended_roles.*' => 'in:owner,frontend,backend,pm,qa,designer',
        ]);

        // Normalize the URL - add https:// if no protocol is present
        $link = $validated['link'];
        if (!preg_match('/^https?:\/\//', $link)) {
            $link = 'https://' . $link;
        }

        // Validate the normalized URL
        if (!filter_var($link, FILTER_VALIDATE_URL)) {
            return response()->json([
                'message' => 'Невалиден URL адрес',
                'errors' => ['link' => ['Моля, въведете валиден URL адрес']]
            ], 422);
        }

        try {
            // Owners can create tools as approved, others create as pending
            $status = $request->user()->role === 'owner' ? Tool::STATUS_APPROVED : Tool::STATUS_PENDING;
            $approvedAt = $request->user()->role === 'owner' ? now() : null;
            $approvedBy = $request->user()->role === 'owner' ? $request->user()->id : null;

            $tool = Tool::create([
                'name' => $validated['name'],
                'link' => $link, // Use the normalized URL
                'description' => $validated['description'],
                'documentation' => $validated['documentation'] ?? null,
                'usage_instructions' => $validated['usage_instructions'] ?? null,
                'examples' => $validated['examples'] ?? null,
                'category_id' => $validated['category_id'] ?? null,
                'images' => $validated['images'] ?? null,
                'user_id' => $request->user()->id,
                'is_active' => true,
                'status' => $status,
                'approved_at' => $approvedAt,
                'approved_by' => $approvedBy,
            ]);

            // Attach tags if provided
            if (isset($validated['tags'])) {
                $tool->tags()->attach($validated['tags']);
            }

            // Attach recommended roles if provided
            if (isset($validated['recommended_roles'])) {
                foreach ($validated['recommended_roles'] as $role) {
                    // Find users with this role and attach them
                    $users = \App\Models\User::where('role', $role)->get();
                    foreach ($users as $user) {
                        $tool->recommendedUsers()->attach($user->id, [
                            'role_type' => 'recommended_for',
                            'notes' => "Препоръчан за {$role} роля"
                        ]);
                    }
                }
            }

            // Load relationships for response
            $tool->load(['category', 'creator', 'tags', 'recommendedUsers']);

            // Log the activity
            ActivityLogService::logCreated($tool, $request->user());

            // Clear relevant caches
            CacheService::clearToolCaches();

            $message = $status === Tool::STATUS_APPROVED
                ? 'Инструментът е създаден и одобрен успешно'
                : 'Инструментът е създаден и изпратен за одобрение';

            return response()->json([
                'message' => $message,
                'tool' => $tool
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при създаване на инструмента',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified tool
     */
    public function show(Tool $tool): JsonResponse
    {
        $tool->load(['category', 'creator', 'tags', 'recommendedUsers']);

        return response()->json($tool);
    }

    /**
     * Update the specified tool
     */
    public function update(Request $request, Tool $tool): JsonResponse
    {
        // Check if user can update this tool (creator or owner role)
        if ($request->user()->id !== $tool->user_id && $request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нямате право да редактирате този инструмент'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'link' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'documentation' => 'nullable|string',
            'usage_instructions' => 'nullable|string',
            'examples' => 'nullable|string',
            'category_id' => 'nullable|exists:categories,id',
            'images' => 'nullable|array',
            'images.*' => 'nullable|string',
            'tags' => 'nullable|array',
            'tags.*' => 'exists:tags,id',
            'recommended_roles' => 'nullable|array',
            'recommended_roles.*' => 'in:owner,frontend,backend,pm,qa,designer',
            'is_active' => 'sometimes|boolean',
        ]);

        // Normalize the URL if provided - add https:// if no protocol is present
        if (isset($validated['link'])) {
            $link = $validated['link'];
            if (!preg_match('/^https?:\/\//', $link)) {
                $link = 'https://' . $link;
            }

            // Validate the normalized URL
            if (!filter_var($link, FILTER_VALIDATE_URL)) {
                return response()->json([
                    'message' => 'Невалиден URL адрес',
                    'errors' => ['link' => ['Моля, въведете валиден URL адрес']]
                ], 422);
            }

            $validated['link'] = $link; // Update with normalized URL
        }

        try {
            $tool->update($validated);

            // Update tags if provided
            if (isset($validated['tags'])) {
                $tool->tags()->sync($validated['tags']);
            }

            // Update recommended roles if provided
            if (isset($validated['recommended_roles'])) {
                // Clear existing role recommendations
                $tool->recommendedUsers()->detach();

                // Add new role recommendations
                foreach ($validated['recommended_roles'] as $role) {
                    $users = \App\Models\User::where('role', $role)->get();
                    foreach ($users as $user) {
                        $tool->recommendedUsers()->attach($user->id, [
                            'role_type' => 'recommended_for',
                            'notes' => "Препоръчан за {$role} роля"
                        ]);
                    }
                }
            }

            $tool->load(['category', 'creator', 'tags', 'recommendedUsers']);

            // Clear relevant caches
            CacheService::clearToolCaches();

            return response()->json([
                'message' => 'Инструментът е обновен успешно',
                'tool' => $tool
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при обновяване на инструмента',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified tool
     */
    public function destroy(Request $request, Tool $tool): JsonResponse
    {
        // Check if user can delete this tool (creator or owner role)
        if ($request->user()->id !== $tool->user_id && $request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нямате право да изтриете този инструмент'
            ], 403);
        }

        try {
            // Log the activity before deletion
            ActivityLogService::logDeleted($tool, $request->user());

            $tool->delete();

            // Clear relevant caches
            CacheService::clearToolCaches();

            return response()->json([
                'message' => 'Инструментът е изтрит успешно'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при изтриване на инструмента',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve a tool (owner only)
     */
    public function approve(Request $request, Tool $tool): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нямате право да одобрявате инструменти'
            ], 403);
        }

        // Check if tool is not already approved
        if ($tool->isApproved()) {
            return response()->json([
                'message' => 'Инструментът вече е одобрен'
            ], 422);
        }

        try {
            $tool->update([
                'status' => Tool::STATUS_APPROVED,
                'approved_at' => now(),
                'approved_by' => $request->user()->id,
                'rejection_reason' => null, // Clear any previous rejection reason
            ]);

            $tool->load(['category', 'creator', 'tags', 'recommendedUsers', 'approver']);

            // Log the activity
            ActivityLogService::logToolApproved($tool, $request->user());

            // Clear relevant caches
            CacheService::clearToolCaches();

            return response()->json([
                'message' => 'Инструментът е одобрен успешно',
                'tool' => $tool
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при одобряване на инструмента',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject a tool (owner only)
     */
    public function reject(Request $request, Tool $tool): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нямате право да отказвате инструменти'
            ], 403);
        }

        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:500',
        ]);

        try {
            $tool->update([
                'status' => Tool::STATUS_REJECTED,
                'approved_at' => null,
                'approved_by' => null,
                'rejection_reason' => $validated['rejection_reason'],
            ]);

            $tool->load(['category', 'creator', 'tags', 'recommendedUsers', 'approver']);

            // Log the activity
            ActivityLogService::logToolRejected($tool, $request->user(), $validated['rejection_reason']);

            // Clear relevant caches
            CacheService::clearToolCaches();

            return response()->json([
                'message' => 'Инструментът е отказан успешно',
                'tool' => $tool
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Грешка при отказване на инструмента',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get pending tools for admin review (owner only)
     */
    public function pending(Request $request): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нямате право да преглеждате чакащи инструменти'
            ], 403);
        }

        $query = Tool::with(['category', 'creator', 'tags', 'recommendedUsers'])
                     ->pending()
                     ->active();

        // Search by name or description
        if ($request->has('search') && $request->search) {
            $query->search($request->search);
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->byCategory($request->category_id);
        }

        // Pagination
        $perPage = $request->get('per_page', 15);
        $tools = $query->latest()->paginate($perPage);

        return response()->json($tools);
    }

    /**
     * Get approval statistics (owner only)
     */
    public function approvalStats(Request $request): JsonResponse
    {
        // Check if user is owner
        if ($request->user()->role !== 'owner') {
            return response()->json([
                'message' => 'Нямате право да преглеждате статистики за одобрения'
            ], 403);
        }

        $stats = [
            'pending_count' => Tool::pending()->active()->count(),
            'approved_count' => Tool::approved()->active()->count(),
            'rejected_count' => Tool::rejected()->active()->count(),
            'total_count' => Tool::active()->count(),
            'pending_today' => Tool::pending()->active()->whereDate('created_at', today())->count(),
            'approved_today' => Tool::approved()->active()->whereDate('approved_at', today())->count(),
        ];

        return response()->json($stats);
    }
}
