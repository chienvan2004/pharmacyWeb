<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id', 
        'image',
        'is_main',
    ];
    public function product(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
