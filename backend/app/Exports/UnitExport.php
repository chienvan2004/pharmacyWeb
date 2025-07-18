<?php

namespace App\Exports;

use App\Models\Unit;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class UnitExport implements FromCollection, WithHeadings, WithMapping
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return Unit::all();
    }

    public function map($tag): array
    {

        return [
            $tag->id,
            $tag->unit_name,
        ];
    }


    public function headings(): array
    {
        return [
            'ID',
            'Tên đơn vị',
        ];
    }
}
