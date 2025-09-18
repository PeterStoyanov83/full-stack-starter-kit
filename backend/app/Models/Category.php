<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get all tools in this category
     */
    public function tools(): HasMany
    {
        return $this->hasMany(Tool::class);
    }

    /**
     * Get active tools in this category
     */
    public function activeTools(): HasMany
    {
        return $this->hasMany(Tool::class)->where('is_active', true);
    }

    /**
     * Scope a query to only include active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Get the count of tools in this category
     */
    public function getToolsCountAttribute()
    {
        return $this->tools()->count();
    }

    /**
     * Get the count of active tools in this category
     */
    public function getActiveToolsCountAttribute()
    {
        return $this->activeTools()->count();
    }
}
