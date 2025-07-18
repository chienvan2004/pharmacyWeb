<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    protected $table = 'tags';

    protected $fillable = [
        'tag_name',
        'active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'id' => 'integer',
        'active' => 'boolean',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_tags');
    }
    protected static function boot()
    {
        
        parent::boot();

        static::creating(function ($tags) {
            $tags->slug = Str::slug($tags->tag_name);
        });

        static::updating(function ($tags) {
            $tags->slug = Str::slug($tags->tag_name);
        });
    }
}
