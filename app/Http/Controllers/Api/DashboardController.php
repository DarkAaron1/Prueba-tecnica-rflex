<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\AttendanceMark;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
{
    $user = $request->user();
    $today = Carbon::today();
    $startOfMonth = Carbon::now()->startOfMonth();

    // 1. Base de las consultas
    $shiftQuery = Shift::whereDate('scheduled_in', $today);
    $markQuery = AttendanceMark::whereDate('timestamp', $today);
    $employeeQuery = Employee::query();

    // 2. Aplicar filtros según Rol (Seguridad de datos)
    if ($user->role === 'manager') {
        $managerEmployee = $user->employee;
        if ($managerEmployee) {
            $areaId = $managerEmployee->area_id;
            $employeeQuery->where('area_id', $areaId);
            $shiftQuery->whereHas('employee', fn($q) => $q->where('area_id', $areaId));
            $markQuery->whereIn('employee_rut', function ($q) use ($areaId) {
                $q->select('rut')->from('employees')->where('area_id', $areaId);
            });
        }
    } elseif ($user->role === 'employee') {
        $rut = $user->employee->rut ?? $user->rut;
        $shiftQuery->whereHas('employee', fn($q) => $q->where('rut', $rut));
        $markQuery->where('employee_rut', $rut);
        $employeeQuery->where('rut', $rut);
    }

    // 3. Cálculo de KPIs Generales
    $summary = [
        'total_employees' => $employeeQuery->count(),
        'shifts_today'    => (clone $shiftQuery)->count(),
        'present_today'   => (clone $shiftQuery)->where('status', 'present')->count(),
        'late_today'      => (clone $shiftQuery)->where('status', 'late')->count(),
        'marks_today'     => $markQuery->count(),
        'active_devices'  => \App\Models\Device::where('last_sync_at', '>', now()->subMinutes(10))->count(),
        'monthly_hours'   => '00:00', // Default
    ];

    // 4. Lógica específica para el Empleado (Turno y Horas del Mes)
    $todayShiftData = null;
    if ($user->role === 'employee' && $user->employee) {
        // Turno de hoy formateado
        $shift = Shift::where('employee_id', $user->employee->id)
            ->whereDate('scheduled_in', $today)
            ->with(['actualIn', 'actualOut'])
            ->first();

        if ($shift) {
            $todayShiftData = [
                'id' => $shift->id,
                'status' => $shift->status,
                'scheduled_in_time' => Carbon::parse($shift->scheduled_in)->format('H:i'),
                'scheduled_out_time' => Carbon::parse($shift->scheduled_out)->format('H:i'),
                'actual_in' => $shift->actualIn ? Carbon::parse($shift->actualIn->timestamp)->format('H:i:s') : null,
                'actual_out' => $shift->actualOut ? Carbon::parse($shift->actualOut->timestamp)->format('H:i:s') : null,
            ];
        }

        // Sumatoria de horas del mes
        $totalMinutes = Shift::where('employee_id', $user->employee->id)
            ->whereBetween('scheduled_in', [$startOfMonth, now()])
            ->whereNotNull('actual_in_id')
            ->whereNotNull('actual_out_id')
            ->get()
            ->sum(function($s) {
                return Carbon::parse($s->actualIn->timestamp)->diffInMinutes(Carbon::parse($s->actualOut->timestamp));
            });

        $hours = floor($totalMinutes / 60);
        $minutes = $totalMinutes % 60;
        $summary['monthly_hours'] = sprintf('%02d:%02d', $hours, $minutes);
    }

    // 5. Últimas marcas para la tabla
    $latestMarks = $markQuery->with('device')
        ->orderBy('timestamp', 'desc')
        ->take(10)
        ->get()
        ->map(fn($m) => [
            'id' => $m->id,
            'rut' => $m->employee_rut,
            'tipo' => $m->type === 'in' ? 'Entrada' : 'Salida',
            'hora' => Carbon::parse($m->timestamp)->format('H:i:s'),
            'dispositivo' => $m->device->name ?? 'Desconocido',
        ]);

    return Inertia::render('Dashboard', [
        'summary'     => $summary,
        'latestMarks' => $latestMarks,
        'todayShift'  => $todayShiftData,
        'date'        => $today->format('d-m-Y'),
        'userRole'    => $user->role
    ]);
}
}