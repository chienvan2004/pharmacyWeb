<?php

namespace App\Exports;

use App\Models\Product;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class ProductsExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Product::with('brands')->get();
    }
    public function map($product): array
    {
        $brandNames = $product->brands->pluck('brand_name')->implode(', '); 

        return [
            $product->id,
            $product->product_name,
            $brandNames ?: 'Chưa có thương hiệu',
            $product->buying_price,
        ];
    }


    public function headings(): array
    {
        return [
            'ID',
            'Tên sản phẩm',
            'Thương hiệu',
            'Giá bán',
        ];
    }
}
