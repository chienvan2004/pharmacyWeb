<?php

namespace App\Exports;

use App\Models\ProductStore;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class ProductStoresExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return ProductStore::all();
    }
    public function headings(): array
    {
        return ['ID', 'Product ID', 'Root Price', 'Quantity', 'Created By', 'Updated By', 'Created At', 'Updated At'];
    }
}
