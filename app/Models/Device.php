<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = [
        'area_id', 
        'name', 
        'serial_number', 
        'type', 
        'last_sync_at',
        'is_active' // Sugerencia: Para dar de baja dispositivos sin borrar historial
    ];

    protected $casts = [
        'last_sync_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    public function area()
    {
        return $this->belongsTo(Area::class);
    }

    public function attendanceMarks()
    {
        return $this->hasMany(AttendanceMark::class);
    }

    /**
     * Scope para filtrar solo dispositivos operativos.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Helper para verificar si el dispositivo está "fuera de línea"
     * (Ejemplo: si no ha sincronizado en los últimos 5 minutos)
     */
    public function isOffline(): bool
    {
        if (!$this->last_sync_at) return true;
        return $this->last_sync_at->diffInMinutes(now()) > 5;
    }
}