<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Device;
use App\Models\AttendanceMark;
use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class Asistencia extends Controller
{
    /**
     * Recibe lotes de marcas desde relojes, App o API.
     * Endpoint sugerido: POST /api/v1/marcas
     */
    public function store(Request $request)
    {
        // 1. Validación básica
        $data = $request->validate([
            'device_serial' => 'required|string|exists:devices,serial_number',
            'marks' => 'required|array|min:1',
            'marks.*.rut' => 'required|string',
            'marks.*.type' => 'required|in:in,out',
            'marks.*.timestamp' => 'required|date',
        ]);

        // 2. Identificar el dispositivo y actualizar su pulso (heartbeat)
        $device = Device::where('serial_number', $data['device_serial'])->first();
        $device->update(['last_sync_at' => now()]);

        $processed = 0;
        $duplicates = 0;

        // 3. Procesamiento del lote
        // Usamos un DB::transaction para asegurar que si algo catastrófico pasa, no queden datos corruptos.
        DB::transaction(function () use ($data, $device, &$processed, &$duplicates) {
            foreach ($data['marks'] as $markData) {
                try {
                    // El duplicate_hash se genera automáticamente en el modelo (booted)
                    AttendanceMark::create([
                        'employee_rut' => $markData['rut'],
                        'device_id'    => $device->id,
                        'source'       => $device->type, // 'clock', 'app', etc.
                        'type'         => $markData['type'],
                        'timestamp'    => Carbon::parse($markData['timestamp']),
                        'metadata'     => $markData['metadata'] ?? [],
                    ]);
                    $processed++;
                } catch (\Illuminate\Database\QueryException $e) {
                    // Si el error es por duplicidad (23000), lo ignoramos y seguimos
                    if ($e->getCode() == '23000') {
                        $duplicates++;
                        continue;
                    }
                    throw $e; // Si es otro error, lanzamos la excepción
                }
            }
        });

        // 4. Respuesta amigable para el hardware
        return response()->json([
            'status' => 'success',
            'message' => 'Lote procesado',
            'summary' => [
                'received' => count($data['marks']),
                'saved' => $processed,
                'ignored_duplicates' => $duplicates
            ]
        ], 200);
    }

    /**
     * Listar marcas de asistencia con filtros.
     * GET /api/asistencia/marcas?employee_rut=123&date=2026-02-25
     */
    public function index(Request $request)
    {
        $query = AttendanceMark::query();

        if ($request->has('employee_rut')) {
            $query->where('employee_rut', $request->employee_rut);
        }

        if ($request->has('date')) {
            $date = Carbon::parse($request->date);
            $query->whereDate('timestamp', $date);
        }

        if ($request->has('device_id')) {
            $query->where('device_id', $request->device_id);
        }

        $marks = $query->with('device')->paginate(50);

        return response()->json($marks);
    }

    /**
     * Mostrar detalles de una marca específica.
     * GET /api/asistencia/marcas/{id}
     */
    public function show($id)
    {
        $mark = AttendanceMark::with('device')->findOrFail($id);
        return response()->json($mark);
    }

    /**
     * Listar turnos de un empleado con métricas.
     * GET /api/asistencia/turnos?employee_id=1&month=2026-02
     */
    public function turnos(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'month' => 'nullable|date_format:Y-m'
        ]);

        $query = Shift::where('employee_id', $request->employee_id)
            ->with(['employee', 'actualIn', 'actualOut']);

        if ($request->has('month')) {
            $query->whereYear('scheduled_in', Carbon::parse($request->month)->year)
                  ->whereMonth('scheduled_in', Carbon::parse($request->month)->month);
        }

        $shifts = $query->get()->map(function ($shift) {
            return [
                'id' => $shift->id,
                'scheduled_in' => $shift->scheduled_in,
                'scheduled_out' => $shift->scheduled_out,
                'actual_in' => $shift->actualIn?->timestamp,
                'actual_out' => $shift->actualOut?->timestamp,
                'status' => $shift->status,
                'delay_minutes' => $shift->delay_minutes,
                'overtime_minutes' => $shift->overtime_minutes,
                'undone_minutes' => $shift->undone_minutes,
            ];
        });

        return response()->json($shifts);
    }

    /**
     * Conciliar manualmente un turno (útil para admins).
     * POST /api/asistencia/conciliar/{shift_id}
     */
    public function conciliar($shiftId)
    {
        $shift = Shift::findOrFail($shiftId);
        
        // Buscar marcas cercanas al horario programado
        $inMark = AttendanceMark::where('employee_rut', $shift->employee->rut)
            ->where('type', 'in')
            ->whereBetween('timestamp', [
                $shift->scheduled_in->copy()->subMinutes(30),
                $shift->scheduled_in->copy()->addMinutes(30)
            ])
            ->orderBy('timestamp')
            ->first();

        $outMark = AttendanceMark::where('employee_rut', $shift->employee->rut)
            ->where('type', 'out')
            ->whereBetween('timestamp', [
                $shift->scheduled_out->copy()->subMinutes(30),
                $shift->scheduled_out->copy()->addMinutes(30)
            ])
            ->orderBy('timestamp', 'desc')
            ->first();

        $shift->update([
            'actual_in_id' => $inMark?->id,
            'actual_out_id' => $outMark?->id,
        ]);

        $shift->calculateMetrics();

        return response()->json([
            'message' => 'Turno conciliado',
            'shift' => $shift->load(['actualIn', 'actualOut'])
        ]);
    }
}