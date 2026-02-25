<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Company extends Model
{
    use HasRelationships;
    protected $fillable = ['holding_id', 'name', 'rut'];

    public function holding()
    {
        return $this->belongsTo(Holding::class);
    }

    public function branches()
    {
        return $this->hasMany(Branch::class);
    }

    /**
     * Obtener todas las áreas de la empresa a través de las sucursales.
     */
    public function areas(): HasManyThrough
    {
        return $this->hasManyThrough(Area::class, Branch::class);
    }

    /**
     * Obtener todos los trabajadores de la empresa.
     * Fundamental para el reporte de remuneraciones global.
     */
    public function employees()
    {
        return $this->hasManyDeep(
            Employee::class,
            [Branch::class, Area::class],
            ['company_id', 'branch_id', 'area_id'], // Claves foráneas en orden
            ['id', 'id', 'id'] // Claves locales en orden
        );
    }
}