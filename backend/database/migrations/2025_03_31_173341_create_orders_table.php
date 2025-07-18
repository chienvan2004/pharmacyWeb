<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->unsignedBigInteger('customer_id')->nullable();
            $table->unsignedBigInteger('order_status_id')->nullable();
            $table->timestamp('order_approved_at')->nullable();
            $table->timestamp('order_delivered_carrier_date')->nullable();
            $table->timestamp('order_delivered_customer_date')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->foreign('coupon_id')->references('id')->on('coupons')->nullOnDelete();
            $table->foreign('customer_id')->references('id')->on('users');
            $table->foreign('order_status_id')->references('id')->on('order_statuses')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
