<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Slideshow extends Model
{
    use HasFactory;

    protected $fillable = [
        'image',
        'link',
        'active',
        'clicks',
        'created_by',
        'updated_by',
    ];
}
