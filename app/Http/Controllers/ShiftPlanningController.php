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
        $employees = Employee::with(['user', 'area.branch.company', 'shifts' => function($query) use ($startOfWeek, $endOfWeek) {
            $query->whereBetween('scheduled_in', [$startOfWeek, $endOfWeek]);
        }])->get();

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
            'in_time' => 'required', // HH:mm
            'out_time' => 'required', // HH:mm
        ]);

        $scheduledIn = Carbon::parse($request->date . ' ' . $request->in_time);
        $scheduledOut = Carbon::parse($request->date . ' ' . $request->out_time);

        // Si la salida es menor a la entrada, asumimos que es al día siguiente (turno noche)
        if ($scheduledOut->lt($scheduledIn)) {
            $scheduledOut->addDay();
        }

        Shift::updateOrCreate(
            [
                'employee_id' => $request->employee_id,
                'scheduled_in' => $scheduledIn,
            ],
            [
                'scheduled_out' => $scheduledOut,
                'status' => 'pending'
            ]
        );

        return back()->with('message', 'Turno asignado correctamente');
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
}