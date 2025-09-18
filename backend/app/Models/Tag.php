<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
    ];

    /**
     * Get all tools with this tag
     */
    public function tools(): BelongsToMany
    {
        return $this->belongsToMany(Tool::class, 'tool_tag')->withTimestamps();
    }

    /**
     * Get active tools with this tag
     */
    public function activeTools(): BelongsToMany
    {
        return $this->belongsToMany(Tool::class, 'tool_tag')
                    ->where('tools.is_active', true)
                    ->withTimestamps();
    }

    /**
     * Automatically generate slug when name is set
     */
    public function setNameAttribute($value)
    {
        $this->attributes['name'] = $value;
        $this->attributes['slug'] = Str::slug($value);
    }

    /**
     * Scope a query to find by slug
     */
    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }

    /**
     * Get the count of tools with this tag
     */
    public function getToolsCountAttribute()
    {
        return $this->tools()->count();
    }

    /**
     * Get the count of active tools with this tag
     */
    public function getActiveToolsCountAttribute()
    {
        return $this->activeTools()->count();
    }
}
