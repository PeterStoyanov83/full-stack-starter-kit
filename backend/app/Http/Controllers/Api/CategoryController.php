<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * Display a listing of active categories with Redis caching
     */
    public function index(): JsonResponse
    {
        $categories = Cache::remember('categories_with_tool_counts', 3600, function () {
            return Category::active()
                          ->withCount('activeTools')
                          ->orderBy('name')
                          ->get();
        });

        return response()->json($categories);
    }

    /**
     * Display the specified category with its tools (cached)
     */
    public function show(Category $category): JsonResponse
    {
        $categoryWithTools = Cache::remember("category_{$category->id}_with_tools", 1800, function () use ($category) {
            $category->load(['activeTools.tags', 'activeTools.creator']);
            return $category;
        });

        return response()->json($categoryWithTools);
    }
}
