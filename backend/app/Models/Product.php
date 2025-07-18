<?php

namespace App\Models;

use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{

    protected $fillable = [
        'image',
        'product_name',
        'buying_price',
        'short_description',
        'product_description',
        'active',
        'sort_order',
        'disable_out_of_stock',
        'unit_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'id' => 'integer',
        'buying_price' => 'decimal:2',
        'active' => 'boolean',
        'disable_out_of_stock' => 'boolean',
        'unit_id' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function productSale(): HasOne
    {
        return $this->hasOne(ProductSale::class);
    }

    public function productStore(): HasOne
    {
        return $this->hasOne(ProductStore::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'product_categories');
    }

    public function brands(): BelongsToMany
    {
        return $this->belongsToMany(Brand::class, 'product_brands');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function coupons(): BelongsToMany
    {
        return $this->belongsToMany(Coupon::class, 'product_coupons');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);    
    }

    public function cardItems(): HasMany
    {
        return $this->hasMany(CardItem::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'product_tags');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(ProductReview::class);
    }




    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            $product->slug = Str::slug($product->product_name);
        });

        static::updating(function ($product) {
            $product->slug = Str::slug($product->product_name);
        });
    }
}
