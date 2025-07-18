<?php

namespace App\Imports;

use App\Models\ProductSale;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProductSaleImport implements ToModel, WithHeadingRow
{
    /**
    * @param array $row
    *
    * @return \Illuminate\Database\Eloquent\Model|null
    */
    public function model(array $row)
    {
        return new ProductSale([
            'product_id' => $row['product_id'],
            'sale_price' => $row['sale_price'],
            'sale_start_date' => $row['sale_start_date'],
            'sale_end_date' => $row['sale_end_date'],
        ]);

        
    }
    public function rules(): array
    {
        return [
            'product_id' => 'required|integer|exists:products,id',
            'sale_price' => 'required|numeric|min:0',
            'sale_start_date' => 'required|date',
            'sale_end_date' => 'required|date|after_or_equal:sale_start_date',
        ];
    }
}
