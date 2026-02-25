<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Branch extends Model
{
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
}
