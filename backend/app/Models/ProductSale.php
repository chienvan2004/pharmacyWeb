<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSale extends Model
{

    protected $fillable = [
        'product_id',
        'sale_price',
        'sale_start_date',
        'sale_end_date',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'id' => 'integer',
        'product_id' => 'integer',
        'sale_price' => 'decimal:2',
        'sale_start_date' => 'datetime',
        'sale_end_date' => 'datetime',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
