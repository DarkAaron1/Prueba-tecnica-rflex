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
        
        // 1. Base de las consultas
        $shiftQuery = Shift::whereDate('scheduled_in', $today);
        $markQuery = AttendanceMark::whereDate('timestamp', $today);
        $employeeQuery = Employee::query();

        // 2. Aplicar filtros según Rol
        if ($user->role === 'manager') {
            // El manager solo ve su área (asumiendo que el User tiene relación con Employee)
            $managerEmployee = $user->employee; 
            
            if ($managerEmployee) {
                $areaId = $managerEmployee->area_id;

                $employeeQuery->where('area_id', $areaId);
                
                $shiftQuery->whereHas('employee', function($q) use ($areaId) {
                    $q->where('area_id', $areaId);
                });

                $markQuery->whereIn('employee_rut', function($q) use ($areaId) {
                    $q->select('rut')->from('employees')->where('area_id', $areaId);
                });
            }
        } elseif ($user->role === 'employee') {
            // Si un empleado entra al dashboard, lo limitamos a sus propios datos
            $rut = $user->employee->rut ?? $user->rut;
            $shiftQuery->whereHas('employee', fn($q) => $q->where('rut', $rut));
            $markQuery->where('employee_rut', $rut);
            $employeeQuery->where('rut', $rut);
        }

        // 3. Ejecutar cálculos de resumen (KPIs)
        $summary = [
            'total_employees' => $employeeQuery->count(),
            'shifts_today'    => (clone $shiftQuery)->count(),
            'present_today'   => (clone $shiftQuery)->where('status', 'present')->count(),
            'absent_today'    => (clone $shiftQuery)->where('status', 'absent')->count(),
            'late_today'      => (clone $shiftQuery)->where('status', 'late')->count(),
            'marks_today'     => $markQuery->count(),
            'active_devices'  => \App\Models\Device::where('last_sync_at', '>', now()->subMinutes(10))->count(),
        ];

        // 4. Obtener últimas marcas para la tabla
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
            'summary' => $summary,
            'latestMarks' => $latestMarks,
            'date' => $today->format('d-m-Y'),
            'userRole' => $user->role
        ]);
    }
}