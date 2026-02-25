<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Employee extends Model
{
    protected $fillable = ['user_id', 'area_id', 'rut', 'phone', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Accesor para asegurar que el RUT siempre se maneje sin puntos ni guiones
     * al compararlo con las marcas del dispositivo.
     */
    protected function rut(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => preg_replace('/[^0-9kK]/', '', $value),
        );
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function shifts()
    {
        return $this->hasMany(Shift::class);
    }

    /**
     * Obtener las marcas asociadas al trabajador a través de su RUT.
     * Importante para el sistema de marcas externo.
     */
    public function attendanceMarks()
    {
        return $this->hasMany(AttendanceMark::class, 'employee_rut', 'rut');
    }
}