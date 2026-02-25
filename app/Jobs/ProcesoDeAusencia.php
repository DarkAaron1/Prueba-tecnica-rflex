<?php

namespace App\Jobs;

use App\Models\Shift;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcesoDeAusencia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        Log::info("Iniciando Job de Marcado de Ausencias...");

        $absenceThresholdHours = config('attendance.absence_threshold_hours', 4); // Configurable
        $processed = 0;
        $errors = 0;

        // Procesar solo shifts pasados
        Shift::where('status', 'pending')
            ->whereNull('actual_in_id')
            ->where('scheduled_in', '<', now()->subHours($absenceThresholdHours))
            ->where('scheduled_in', '<', now()->startOfDay()) // Solo días anteriores
            ->chunk(100, function ($shifts) use (&$processed, &$errors) {
                foreach ($shifts as $shift) {
                    try {
                        // Verificar si hay marca de salida (posible llegada tarde)
                        $hasOutMark = $shift->employee->attendanceMarks()
                            ->where('type', 'out')
                            ->whereBetween('timestamp', [
                                $shift->scheduled_in,
                                $shift->scheduled_out->copy()->addHours(2)
                            ])
                            ->exists();

                        if ($hasOutMark) {
                            // Marcar como late en lugar de absent
                            $shift->update(['status' => 'late', 'processed_at' => now()]);
                        } else {
                            // Ausencia completa
                            $shift->update([
                                'status' => 'absent',
                                'undone_minutes' => $shift->scheduled_in->diffInMinutes($shift->scheduled_out),
                                'processed_at' => now()
                            ]);
                        }
                        $processed++;
                    } catch (\Exception $e) {
                        Log::error("Error procesando ausencia para shift {$shift->id}: {$e->getMessage()}");
                        $errors++;
                    }
                }
            });

        Log::info("Ausencias procesadas: {$processed}, Errores: {$errors}");
    }
}
