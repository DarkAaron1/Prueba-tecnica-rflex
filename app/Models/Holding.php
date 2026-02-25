<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Staudenmeir\EloquentHasManyDeep\HasRelationships;

class Holding extends Model
{
    use HasRelationships;

    protected $fillable = ['name'];

    public function companies()
    {
        return $this->hasMany(Company::class);
    }

    /**
     * Acceder directamente a todas las sucursales del holding.
     */
    public function branches()
    {
        return $this->hasManyDeep(
            Branch::class,
            [Company::class],
            ['holding_id', 'company_id'],
            ['id', 'id']
        );
    }

    /**
     * Acceder directamente a todas las áreas del holding.
     */
    public function areas()
    {
        return $this->hasManyDeep(
            Area::class,
            [Company::class, Branch::class],
            ['holding_id', 'company_id', 'branch_id'],
            ['id', 'id', 'id']
        );
    }

    /**
     * Acceder directamente a todos los empleados del holding.
     * Útil para reportes globales de remuneraciones.
     */
    public function employees()
    {
        return $this->hasManyDeep(
            Employee::class,
            [Company::class, Branch::class, Area::class],
            ['holding_id', 'company_id', 'branch_id', 'area_id'],
            ['id', 'id', 'id', 'id']
        );
    }

    /**
     * Acceder directamente a todos los dispositivos del holding.
     */
    public function devices()
    {
        return $this->hasManyDeep(
            Device::class,
            [Company::class, Branch::class, Area::class],
            ['holding_id', 'company_id', 'branch_id', 'area_id'],
            ['id', 'id', 'id', 'id']
        );
    }
}
