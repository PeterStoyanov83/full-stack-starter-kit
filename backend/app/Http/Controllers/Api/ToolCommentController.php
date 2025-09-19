<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tool;
use App\Models\ToolComment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ToolCommentController extends Controller
{
    public function index(Tool $tool): JsonResponse
    {
        $comments = $tool->comments()
            ->with('user:id,name')
            ->paginate(10);

        return response()->json($comments);
    }

    public function store(Request $request, Tool $tool): JsonResponse
    {
        $request->validate([
            'comment' => 'required|string|min:5|max:1000'
        ]);

        $comment = $tool->comments()->create([
            'user_id' => Auth::id(),
            'comment' => $request->comment,
            'is_approved' => true
        ]);

        $comment->load('user:id,name');

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment
        ], 201);
    }

    public function update(Request $request, Tool $tool, ToolComment $comment): JsonResponse
    {
        if ($comment->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'comment' => 'required|string|min:5|max:1000'
        ]);

        $comment->update([
            'comment' => $request->comment
        ]);

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment
        ]);
    }

    public function destroy(Tool $tool, ToolComment $comment): JsonResponse
    {
        if ($comment->user_id !== Auth::id() && !Auth::user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }
}