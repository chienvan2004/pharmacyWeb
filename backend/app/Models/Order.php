<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'coupon_id',
        'user_id',
        'status',
        'profit',
        'payment_method',
        'payment_status',
        'order_approved_at',
        'order_delivered_carrier_date',
        'order_delivered_customer_date',
        'updated_by',
        'created_at',
        'updated_at'
    ];

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function coupon()
    {
        return $this->belongsTo(Coupon::class);
    }
    

}
