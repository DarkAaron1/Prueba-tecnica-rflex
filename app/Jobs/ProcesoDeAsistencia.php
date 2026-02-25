<?php

namespace App\Jobs;

use App\Models\Shift;
use App\Models\AttendanceMark;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcesoDeAsistencia implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle()
    {
        Log::info("Iniciando Job de Asociación de Asistencia...");

        $processed = 0;
        $errors = 0;

        // Procesar en chunks para rendimiento
        Shift::whereIn('status', ['pending', 'late'])
            ->where('scheduled_in', '>=', now()->subDays(1))
            ->with('employee')
            ->chunk(100, function ($shifts) use (&$processed, &$errors) {
                foreach ($shifts as $shift) {
                    try {
                        if ($this->processShift($shift)) {
                            $processed++;
                        }
                    } catch (\Exception $e) {
                        Log::error("Error procesando shift {$shift->id}: {$e->getMessage()}");
                        $errors++;
                    }
                }
            });

        Log::info("Asociación completada: {$processed} turnos procesados, {$errors} errores.");
    }

    protected function processShift(Shift $shift): bool
    {
        $rut = $shift->employee->rut;
        $updated = false;

        // Buscar entrada (verificar no asignada)
        if (!$shift->actual_in_id) {
            $inMark = AttendanceMark::where('employee_rut', $rut)
                ->where('type', 'in')
                ->whereNull('shift_id') // Asumiendo campo para evitar duplicados
                ->whereBetween('timestamp', [
                    $shift->scheduled_in->copy()->subMinutes(60),
                    $shift->scheduled_in->copy()->addMinutes(120)
                ])
                ->orderBy('timestamp', 'asc')
                ->first();

            if ($inMark) {
                $shift->actual_in_id = $inMark->id;
                $inMark->update(['shift_id' => $shift->id]); // Marcar como usada
                $updated = true;
            }
        }

        // Buscar salida (similar)
        if (!$shift->actual_out_id) {
            $outMark = AttendanceMark::where('employee_rut', $rut)
                ->where('type', 'out')
                ->whereNull('shift_id')
                ->whereBetween('timestamp', [
                    $shift->scheduled_out->copy()->subMinutes(30),
                    $shift->scheduled_out->copy()->addMinutes(180)
                ])
                ->orderBy('timestamp', 'desc')
                ->first();

            if ($outMark) {
                $shift->actual_out_id = $outMark->id;
                $outMark->update(['shift_id' => $shift->id]);
                $updated = true;
            }
        }

        if ($updated) {
            $shift->calculateMetrics();
            $shift->update(['processed_at' => now()]);
        }

        return $updated;
    }
}