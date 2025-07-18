<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Post extends Model
{

    protected $fillable = [
        'title',
        'slug',
        'topic_id',
        'content',
        'image',
        'type',
        'active',
        'created_by',
        'updated_by',
    ];
    public function topic(): BelongsTo
    {
        return $this->belongsTo(Topic::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($post) {
            $post->slug = Str::slug($post->title);
        });

        static::updating(function ($post) {
            $post->slug = Str::slug($post->title);
        });
    }
}
