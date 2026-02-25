<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Branch extends Model
{
    use HasRelationships;
    protected $fillable = ['company_id', 'name', 'address'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function areas()
    {
        return $this->hasMany(Area::class);
    }

    /**
     * Relación directa con los empleados de la sucursal.
     * Útil para: Branch::find(1)->employees;
     */
    public function employees(): HasManyThrough
    {
        return $this->hasManyThrough(Employee::class, Area::class);
    }

    /**
     * Relación directa con los dispositivos de la sucursal.
     * Útil para ver qué relojes están online en esta ubicación.
     */
    public function devices(): HasManyThrough
    {
        return $this->hasManyThrough(Device::class, Area::class);
    }

    /**
     * Acceder directamente a todas las marcas de asistencia de la sucursal.
     * Útil para reportes de tráfico por ubicación.
     */
    public function attendanceMarks()
    {
        return $this->hasManyDeep(
            AttendanceMark::class,
            [Area::class, Device::class],
            ['branch_id', 'area_id', 'device_id'],
            ['id', 'id', 'id']
        );
    }
}
