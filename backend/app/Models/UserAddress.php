<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserAddress extends Model
{
    protected $fillable = [
        'user_id',
        'address',
        'dial_code',
        'country',
        'postal_code',
        'city',
        'address_default',
        'created_at',
        'updated_at',
    ];
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    
    public static function boot()
    {
        parent::boot();

        static::saving(function ($address) {
            if ($address->address_default) {
                // Đặt tất cả các địa chỉ khác thành false
                self::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->update(['address_default' => false]);
            }
        });
    }
    
}
