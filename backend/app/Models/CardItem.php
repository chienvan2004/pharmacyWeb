<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CardItem extends Model
{
    protected $fillable = [
        'card_id',
        'product_id',
        'quantity', 
    ];
    public function card(): BelongsTo
    {
        return $this->belongsTo(Card::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
