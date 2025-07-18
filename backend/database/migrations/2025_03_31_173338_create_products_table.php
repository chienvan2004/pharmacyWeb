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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('product_name');
            $table->decimal('buying_price')->nullable();
            $table->string('short_description')->nullable();
            $table->longText('product_description')->nullable();
            $table->boolean('active')->default(false);
            $table->boolean('disable_out_of_stock')->default(true);
            $table->unsignedBigInteger('unit_id')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();

            $table->foreign('unit_id')->references('id')->on('units')->restrictOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
