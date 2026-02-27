<?php

namespace App\Http\Controllers;

use App\Models\Shift;
use App\Models\Employee;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class ReporteController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());
        $areaId = $request->input('area_id');

        $query = Shift::with(['employee.user', 'employee.area'])
            ->whereBetween('scheduled_in', [$startDate . ' 00:00:00', $endDate . ' 23:59:59']);

        if ($areaId) {
            $query->whereHas('employee', fn($q) => $q->where('area_id', $areaId));
        }

        $shifts = $query->get();

        // Procesar datos para el reporte
        $reportData = $shifts->map(function ($shift) {
            return [
                'id' => $shift->id,
                'empleado' => $shift->employee->user->name,
                'rut' => $shift->employee->rut,
                'area' => $shift->employee->area->name,
                'fecha' => Carbon::parse($shift->scheduled_in)->format('d-m-Y'),
                'estado' => $shift->status, // present, absent, late, etc.
                'atraso_minutos' => $shift->delay_minutes ?? 0,
                'extra_minutos' => $shift->overtime_minutes ?? 0,
                'salida_anticipada' => $shift->undone_minutes ?? 0,
                'horas_trabajadas' => $this->calculateWorkedHours($shift),
            ];
        });

        return Inertia::render('Admin/Reportes/index', [
            'reportData' => $reportData,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'area_id' => $areaId
            ],
            'areas' => \App\Models\Area::all()
        ]);
    }

    private function calculateWorkedHours($shift)
    {
        if (!$shift->actualIn || !$shift->actualOut) return "00:00";
        
        $in = Carbon::parse($shift->actualIn->timestamp);
        $out = Carbon::parse($shift->actualOut->timestamp);
        $totalMinutes = $in->diffInMinutes($out);
        
        return sprintf('%02d:%02d', floor($totalMinutes / 60), $totalMinutes % 60);
    }
}