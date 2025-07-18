<?php

namespace App\Exports;

use App\Models\Brand;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class BrandExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Brand::all();
    }

    public function map($brand): array
    {

        return [
            $brand->id,
            $brand->brand_name,
            $brand->description,
        ];
    }


    public function headings(): array
    {
        return [
            'ID',
            'Tên thương hiệu',
            'Mô tả',
        ];
    }
}
