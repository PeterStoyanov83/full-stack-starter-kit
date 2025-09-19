<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\ToolRating;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ToolRatingController extends Controller
{
    public function show(Tool $tool): JsonResponse
    {
        $userRating = $tool->ratings()
            ->where('user_id', Auth::id())
            ->first();

        return response()->json([
            'average_rating' => $tool->average_rating,
            'rating_count' => $tool->rating_count,
            'rating_distribution' => $tool->rating_distribution,
            'user_rating' => $userRating ? $userRating->rating : null
        ]);
    }

    public function store(Request $request, Tool $tool): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5'
        ]);

        $rating = ToolRating::updateOrCreate(
            [
                'tool_id' => $tool->id,
                'user_id' => Auth::id()
            ],
            [
                'rating' => $request->rating
            ]
        );

        $tool->refresh();

        return response()->json([
            'message' => 'Rating submitted successfully',
            'rating' => $rating,
            'average_rating' => $tool->average_rating,
            'rating_count' => $tool->rating_count
        ]);
    }

    public function destroy(Tool $tool): JsonResponse
    {
        $deleted = $tool->ratings()
            ->where('user_id', Auth::id())
            ->delete();

        if (!$deleted) {
            return response()->json(['message' => 'No rating found to delete'], 404);
        }

        $tool->refresh();

        return response()->json([
            'message' => 'Rating removed successfully',
            'average_rating' => $tool->average_rating,
            'rating_count' => $tool->rating_count
        ]);
    }
}