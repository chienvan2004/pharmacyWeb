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
        Schema::create('shipping_rates', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('shipping_zone_id');
            $table->enum('weight_unit', ['g', 'kg'])->default('g');
            $table->decimal('min_value')->default(0)->nullable();
            $table->decimal('max_value')->nullable();
            $table->boolean('no_max')->default(true);
            $table->decimal('price')->nullable();

            $table->foreign('shipping_zone_id')->references('id')->on('shipping_zones')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shipping_rates');
    }
};
