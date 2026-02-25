<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Area extends Model
{
    protected $fillable = ['branch_id', 'name'];

    // Relación base
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    // Un área tiene muchos empleados
    public function employees()
    {
        return $this->hasMany(Employee::class);
    }

    // Un área tiene muchos dispositivos (Relojes biométricos)
    public function devices()
    {
        return $this->hasMany(Device::class);
    }

    /**
     * Obtener todas las marcas de asistencia registradas en esta área
     * Útil para monitorear el tráfico de marcas por zona.
     */
    public function attendanceMarks(): HasManyThrough
    {
        return $this->hasManyThrough(
            AttendanceMark::class, 
            Device::class,
            'area_id',    // Llave foránea en tabla devices
            'device_id',  // Llave foránea en tabla attendance_marks
            'id',         // Llave local en tabla areas
            'id'          // Llave local en tabla devices
        );
    }
}