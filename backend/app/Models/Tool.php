<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tool extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'link',
        'description',
        'documentation',
        'usage_instructions',
        'examples',
        'images',
        'category_id',
        'user_id',
        'is_active',
        'status',
        'approved_at',
        'approved_by',
        'rejection_reason',
    ];

    protected $casts = [
        'images' => 'array',
        'is_active' => 'boolean',
        'approved_at' => 'datetime',
    ];

    /**
     * Tool status constants
     */
    const STATUS_PENDING = 'pending';
    const STATUS_APPROVED = 'approved';
    const STATUS_REJECTED = 'rejected';

    /**
     * Get the category that owns the tool
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Get the user who created the tool
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who approved the tool
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the users this tool is recommended for (many-to-many)
     */
    public function recommendedUsers(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'tool_user')
                    ->withPivot('role_type', 'notes')
                    ->withTimestamps();
    }

    /**
     * Get the tags for this tool
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'tool_tag')->withTimestamps();
    }

    /**
     * Scope a query to only include active tools
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include approved tools
     */
    public function scopeApproved($query)
    {
        return $query->where('status', self::STATUS_APPROVED);
    }

    /**
     * Scope a query to only include pending tools
     */
    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    /**
     * Scope a query to only include rejected tools
     */
    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Scope a query to filter by status
     */
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope a query to filter by category
     */
    public function scopeByCategory($query, $categoryId)
    {
        return $query->where('category_id', $categoryId);
    }

    /**
     * Scope a query to filter by tags
     */
    public function scopeByTags($query, array $tagIds)
    {
        return $query->whereHas('tags', function ($q) use ($tagIds) {
            $q->whereIn('tags.id', $tagIds);
        });
    }

    /**
     * Scope a query to search by name or description
     */
    public function scopeSearch($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
        });
    }

    /**
     * Check if tool is pending approval
     */
    public function isPending(): bool
    {
        return $this->status === self::STATUS_PENDING;
    }

    /**
     * Check if tool is approved
     */
    public function isApproved(): bool
    {
        return $this->status === self::STATUS_APPROVED;
    }

    /**
     * Check if tool is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    /**
     * Get the comments for this tool
     */
    public function comments(): HasMany
    {
        return $this->hasMany(ToolComment::class)->approved()->with('user')->latest();
    }

    /**
     * Get the ratings for this tool
     */
    public function ratings(): HasMany
    {
        return $this->hasMany(ToolRating::class)->with('user');
    }

    /**
     * Get average rating for this tool
     */
    public function getAverageRatingAttribute(): float
    {
        return round($this->ratings()->avg('rating') ?: 0, 1);
    }

    /**
     * Get total number of ratings
     */
    public function getRatingCountAttribute(): int
    {
        return $this->ratings()->count();
    }

    /**
     * Get rating distribution (1-5 stars)
     */
    public function getRatingDistributionAttribute(): array
    {
        $distribution = [];
        for ($i = 1; $i <= 5; $i++) {
            $distribution[$i] = $this->ratings()->where('rating', $i)->count();
        }
        return $distribution;
    }

    /**
     * Get total number of comments
     */
    public function getCommentCountAttribute(): int
    {
        return $this->comments()->count();
    }

    /**
     * Get star display for average rating
     */
    public function getStarDisplayAttribute(): string
    {
        $rating = floor($this->average_rating);
        $hasHalf = ($this->average_rating - $rating) >= 0.5;

        $stars = str_repeat('★', $rating);
        if ($hasHalf) {
            $stars .= '☆'; // Half star representation
            $rating++;
        }
        $stars .= str_repeat('☆', 5 - $rating);

        return $stars;
    }
}
