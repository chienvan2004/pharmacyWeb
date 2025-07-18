<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'discount_value',
        'discount_type',
        'times_used',
        'max_usage',
        'order_amount_limit',
        'coupon_start_date',
        'coupon_end_date',
    ];

    // Quan hệ nhiều-nhiều với Product
    public function products():BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'product_coupons');
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
