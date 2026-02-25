<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Company extends Model
{
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
    public function employees(): HasManyThrough
    {
        // Company -> Branch -> Area -> Employee
        // Nota: Laravel soporta relaciones "Deep" o puedes usar el paquete 'staudenmeir/eloquent-has-many-deep'
        // Por ahora, lo manejaremos a través de Area.
        return $this->hasManyThrough(Employee::class, Area::class, 'branch_id', 'area_id');
    }
}