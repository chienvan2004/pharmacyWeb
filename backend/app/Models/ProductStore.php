<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductStore extends Model
{
    protected $fillable = [
        'product_id',
        'root_price',
        'quantity',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'id' => 'integer',
        'product_id' => 'integer',
        'root_price' => 'decimal:2',
        'quantity' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
