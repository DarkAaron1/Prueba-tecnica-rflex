<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Shift extends Model
{
    protected $fillable = [
        'employee_id', 'scheduled_in', 'scheduled_out',
        'actual_in_id', 'actual_out_id', 'status',
        'delay_minutes', 'overtime_minutes', 'undone_minutes'
    ];

    protected $casts = [
        'scheduled_in' => 'datetime',
        'scheduled_out' => 'datetime',
    ];

    // Relaciones existentes...
    public function employee() { return $this->belongsTo(Employee::class); }
    public function actualIn() { return $this->belongsTo(AttendanceMark::class, 'actual_in_id'); }
    public function actualOut() { return $this->belongsTo(AttendanceMark::class, 'actual_out_id'); }

    /**
     * Calcula la duración teórica del turno en minutos.
     */
    public function getScheduledDurationAttribute(): int
    {
        return $this->scheduled_in->diffInMinutes($this->scheduled_out);
    }

    /**
     * Setea el estado y calcula métricas basándose en las marcas asociadas.
     * Este método será invocado por el Job de los 5 minutos.
     */
    public function calculateMetrics(): void
    {
        if ($this->actualIn) {
            // Calcular Atraso
            $delay = $this->scheduled_in->diffInMinutes($this->actualIn->timestamp, false);
            $this->delay_minutes = $delay > 0 ? $delay : 0;
            
            $this->status = $this->delay_minutes > 0 ? 'late' : 'present';
        }

        if ($this->actualIn && $this->actualOut) {
            // Calcular Horas Extra (Si salió después de lo pactado)
            $overtime = $this->actualOut->timestamp->diffInMinutes($this->scheduled_out, false);
            $this->overtime_minutes = $overtime < 0 ? abs($overtime) : 0;

            // Calcular Salida Anticipada (Horas no trabajadas)
            $early = $this->actualOut->timestamp->diffInMinutes($this->scheduled_out, false);
            $this->undone_minutes = $early > 0 ? $early : 0;
            
            if ($this->undone_minutes > 0) $this->status = 'early_departure';
        }
        
        $this->save();
    }
}