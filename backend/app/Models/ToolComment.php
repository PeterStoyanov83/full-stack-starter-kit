<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class ToolComment extends Model
{
    protected $fillable = [
        'tool_id',
        'user_id',
        'comment',
        'is_approved'
    ];

    protected $casts = [
        'is_approved' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the tool that owns the comment.
     */
    public function tool(): BelongsTo
    {
        return $this->belongsTo(Tool::class);
    }

    /**
     * Get the user that wrote the comment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to get approved comments only.
     */
    public function scopeApproved($query)
    {
        return $query->where('is_approved', true);
    }

    /**
     * Get formatted creation date in Bulgarian.
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->created_at->locale('bg')->diffForHumans();
    }

    /**
     * Get truncated comment for previews.
     */
    public function getTruncatedCommentAttribute(): string
    {
        return strlen($this->comment) > 150
            ? substr($this->comment, 0, 150) . '...'
            : $this->comment;
    }
}
