<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Unit extends Model
{
    use HasFactory;

    protected $fillable = [
        'unit_name',
        'active',
        'created_by',
        'updated_by',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
