<?php

namespace App\Exports;

use App\Models\Category;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class CategoryExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Category::with('parent')->get();
    }
    
    public function map($category): array
    {

        return [
            $category->id,
            $category->category_name,
            $category->parent?->category_name ?? 'Không có', 
            $category->description,
        ];
    }


    public function headings(): array
    {
        return [
            'ID',
            'Tên danh mục',
            'Tên danh cha',
            'Mô tả',
        ];
    }
}
