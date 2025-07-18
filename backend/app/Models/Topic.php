<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;

class Topic extends Model
{

    protected $fillable = [
        'topic_name',
        'created_by',
        'updated_by',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($topic) {
            $topic->slug = Str::slug($topic->topic_name);
        });

        static::updating(function ($topic) {
            $topic->slug = Str::slug($topic->topic_name);
        });
    }
}
