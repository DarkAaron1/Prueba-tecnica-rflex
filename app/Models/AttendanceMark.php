<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids; // Importante para la escalabilidad/migración
use Illuminate\Support\Str;

class AttendanceMark extends Model
{
    use HasUuids; // Cambiamos a UUIDs para que el sistema nuevo y el legado no colisionen

    protected $table = 'attendance_marks';

    protected $fillable = [
        'employee_rut', 
        'device_id', 
        'source', 
        'type', 
        'timestamp', 
        'duplicate_hash', 
        'metadata'
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * El "corazón" de la integridad de marcas.
     */
    protected static function booted()
    {
        static::creating(function ($mark) {
            // 1. Aseguramos que el timestamp sea un objeto Carbon
            $date = \Carbon\Carbon::parse($mark->timestamp);
            
            // 2. Limpiamos el RUT (opcional, pero recomendado para consistencia)
            $rut = preg_replace('/[^0-9kK]/', '', $mark->employee_rut);

            // 3. Generamos el hash: RUT + SENTIDO (in/out) + MINUTO (YmdHi)
            // Ejemplo: 12345678in202602250830
            $mark->duplicate_hash = md5(
                strtolower($rut) . $mark->type . $date->format('YmdHi')
            );
        });
    }

    public function device()
    {
        return $this->belongsTo(Device::class);
    }

    public function actualInShifts()
    {
        return $this->hasMany(Shift::class, 'actual_in_id');
    }

    public function actualOutShifts()
    {
        return $this->hasMany(Shift::class, 'actual_out_id');
    }
}
