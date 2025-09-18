<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;

class TagController extends Controller
{
    /**
     * Display a listing of all tags
     */
    public function index(): JsonResponse
    {
        $tags = Tag::select('tags.*')
                   ->selectRaw('(SELECT COUNT(*) FROM tools INNER JOIN tool_tag ON tools.id = tool_tag.tool_id WHERE tags.id = tool_tag.tag_id AND tools.is_active = 1) as active_tools_count')
                   ->orderBy('name')
                   ->get();

        return response()->json($tags);
    }

    /**
     * Display the specified tag with its tools
     */
    public function show(Tag $tag): JsonResponse
    {
        $tag->load(['activeTools.category', 'activeTools.creator']);

        return response()->json($tag);
    }
}
