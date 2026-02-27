<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class UsersExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
{
    // Solo devolvemos los valores para que no se mezclen las keys del array
    return collect($this->data)->map(function($row) {
        return collect($row)->values();
    });
}

    public function headings(): array
    {
        return [
            'Empleado',
            'RUT',
            'Estado',
            'Horas Trabajadas',
            'Atrasos (min)',
            'Extras (min)'
        ];
    }
}