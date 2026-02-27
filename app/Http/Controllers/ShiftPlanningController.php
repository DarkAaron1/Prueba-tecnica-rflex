<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Shift;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;

class ShiftPlanningController extends Controller
{
    public function index(Request $request)
    {
        // Determinamos el inicio de la semana (Lunes)
        $startOfWeek = $request->has('date')
            ? Carbon::parse($request->date)->startOfWeek()
            : Carbon::now()->startOfWeek();

        $endOfWeek = (clone $startOfWeek)->endOfWeek();

        // Obtenemos empleados con sus turnos en ese rango
        $employees = Employee::with([
            'user',
            'area.branch.company',
            'shifts' => function ($query) use ($startOfWeek, $endOfWeek) {
                $query->whereBetween('scheduled_in', [$startOfWeek, $endOfWeek]);
            }
        ])->get();

        return Inertia::render('Admin/Shift/planning', [
            'employees' => $employees,
            'weekConfig' => [
                'start' => $startOfWeek->format('Y-m-d'),
                'end' => $endOfWeek->format('Y-m-d'),
                'days' => $this->generateWeekDays($startOfWeek)
            ]
        ]);
    }

    private function generateWeekDays(Carbon $start)
    {
        $days = [];
        for ($i = 0; $i < 7; $i++) {
            $date = (clone $start)->addDays($i);
            $days[] = [
                'full_date' => $date->format('Y-m-d'),
                'label' => $date->translatedFormat('D d'),
            ];
        }
        return $days;
    }

    public function store(Request $request)
    {
        $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'date' => 'required|date',
            'in_time' => 'required',
            'out_time' => 'required',
        ]);

        $scheduledIn = Carbon::parse($request->date . ' ' . $request->in_time);
        $scheduledOut = Carbon::parse($request->date . ' ' . $request->out_time);

        if ($scheduledOut->lt($scheduledIn))
            $scheduledOut->addDay();

        // Creamos un nuevo turno (permitiendo múltiples por día)
        Shift::create([
            'employee_id' => $request->employee_id,
            'scheduled_in' => $scheduledIn,
            'scheduled_out' => $scheduledOut,
            'status' => 'pending'
        ]);

        return back()->with('message', 'Turno creado');
    }

    public function update(Request $request, Shift $shift)
    {
        // Bloqueo: Si la hora actual es mayor a la hora programada de inicio
        if (now()->gt($shift->scheduled_in)) {
            return back()->withErrors(['error' => 'El turno ya ha iniciado o ha pasado; no se puede modificar.']);
        }

        $request->validate([
            'in_time' => 'required',
            'out_time' => 'required',
        ]);

        // ... lógica de guardado
    }

    public function destroy(Shift $shift)
    {
        // Bloqueo similar para eliminar
        if (now()->gt($shift->scheduled_in)) {
            return back()->withErrors(['error' => 'No puedes eliminar un turno que ya debería haber comenzado.']);
        }

        $shift->delete();
        return back()->with('message', 'Turno eliminado');
    }
    public function bulkStore(Request $request)
    {
        $request->validate([
            'employee_ids' => 'required|array',
            'dates' => 'required|array',
            'in_time' => 'required',
            'out_time' => 'required',
        ]);

        foreach ($request->employee_ids as $empId) {
            foreach ($request->dates as $date) {
                $scheduledIn = Carbon::parse($date . ' ' . $request->in_time);
                $scheduledOut = Carbon::parse($date . ' ' . $request->out_time);

                if ($scheduledOut->lt($scheduledIn)) {
                    $scheduledOut->addDay();
                }

                Shift::updateOrCreate(
                    ['employee_id' => $empId, 'scheduled_in' => $scheduledIn],
                    ['scheduled_out' => $scheduledOut, 'status' => 'pending']
                );
            }
        }

        return back()->with('message', 'Planificación masiva completada');
    }

    // En ShiftPlanningController.php

    public function copy(Request $request)
    {
        $request->validate([
            'target_date' => 'required|date',
        ]);

        try {
            // 1. Establecemos el inicio de la semana de destino (Lunes 00:00:00)
            $targetMonday = Carbon::parse($request->target_date)->startOfWeek();
            $targetSunday = $targetMonday->copy()->endOfWeek();

            // 2. Definimos la semana de origen (Lunes anterior 00:00:00 al Domingo anterior)
            $sourceMonday = $targetMonday->copy()->subWeek();
            $sourceSunday = $sourceMonday->copy()->endOfWeek();

            // 3. Obtenemos los turnos de la semana pasada
            $pastShifts = Shift::whereBetween('scheduled_in', [$sourceMonday, $sourceSunday])->get();

            if ($pastShifts->isEmpty()) {
                return back()->withErrors(['error' => 'No hay turnos en la semana anterior para copiar.']);
            }

            $createdCount = 0;

            foreach ($pastShifts as $oldShift) {
                // Calculamos la nueva fecha sumando exactamente 7 días
                $newIn = Carbon::parse($oldShift->scheduled_in)->addWeek();
                $newOut = Carbon::parse($oldShift->scheduled_out)->addWeek();

                // Verificamos si el empleado ya tiene un turno que empiece a esa misma hora
                $exists = Shift::where('employee_id', $oldShift->employee_id)
                    ->where('scheduled_in', $newIn)
                    ->exists();

                if (!$exists) {
                    Shift::create([
                        'employee_id' => $oldShift->employee_id,
                        'scheduled_in' => $newIn,
                        'scheduled_out' => $newOut,
                        'status' => 'pending',
                        // Inicializamos los minutos en 0 para los nuevos turnos
                        'delay_minutes' => 0,
                        'overtime_minutes' => 0,
                        'undone_minutes' => 0
                    ]);
                    $createdCount++;
                }
            }

            return back()->with('message', "Éxito: Se copiaron $createdCount turnos.");

        } catch (\Exception $e) {
            // Si hay un error, lo capturamos para que no de Error 500 genérico
            return back()->withErrors(['error' => 'Error al copiar: ' . $e->getMessage()]);
        }
    }
}