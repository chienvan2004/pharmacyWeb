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
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique();
            $table->decimal('discount_value');
            $table->enum('discount_type', ['percent', 'vnd', 'shipping']);
            $table->decimal('times_used')->default(0);
            $table->decimal('max_usage')->nullable();
            $table->decimal('order_amount_limit')->nullable();
            $table->dateTime('coupon_start_date')->nullable();
            $table->dateTime('coupon_end_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
