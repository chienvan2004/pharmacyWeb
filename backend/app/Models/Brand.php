<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Brand extends Model
{
    protected $fillable = [
        'brand_name',
        'icon',
        'active',
        'description',
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
        return $this->belongsToMany(Product::class, 'product_brands');
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($brand) {
            $brand->slug = Str::slug($brand->brand_name);
        });

        static::updating(function ($brand) {
            $brand->slug = Str::slug($brand->brand_name);
        });
    }

}
