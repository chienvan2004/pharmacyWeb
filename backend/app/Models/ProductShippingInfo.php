<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductShippingInfo extends Model
{
    protected $table = 'product_shipping_info';

    protected $fillable = [
        'product_id',
        'weight',
        'weight_unit',
    ];

    protected $casts = [
        'id' => 'integer',
        'product_id' => 'integer',
        'weight' => 'decimal:2',
        'weight_unit' => 'string', // enum will be cast to string
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
