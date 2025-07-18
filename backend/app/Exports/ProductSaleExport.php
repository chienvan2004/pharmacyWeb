<?php

namespace App\Exports;

use App\Models\ProductSale;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProductSaleExport implements FromCollection, WithHeadings
{
    public function collection()
    {
        $data = ProductSale::select('product_id', 'sale_price', 'sale_start_date', 'sale_end_date')->get();
        if ($data->isEmpty()) {
            // Trả về một hàng trống nếu không có dữ liệu
            return collect([[
                'product_id' => null,
                'sale_price' => null,
                'sale_start_date' => null,
                'sale_end_date' => null,
            ]]);
        }
        return $data;
    }

    public function headings(): array
    {
        return [
            'Product ID',
            'Sale Price',
            'Sale Start Date',
            'Sale End Date',
        ];
    }
}
