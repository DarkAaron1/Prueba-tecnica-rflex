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
    /**
     * Obtener resumen general para el dashboard.
     * GET /api/v1/admin/resumen
     */
    public function index()
    {
        $today = Carbon::today();

        $summary = [
            'total_employees' => Employee::count(),
            'shifts_today' => Shift::whereDate('scheduled_in', $today)->count(),
            'present_today' => Shift::whereDate('scheduled_in', $today)->where('status', 'present')->count(),
            'absent_today' => Shift::whereDate('scheduled_in', $today)->where('status', 'absent')->count(),
            'late_today' => Shift::whereDate('scheduled_in', $today)->where('status', 'late')->count(),
            'marks_today' => AttendanceMark::whereDate('timestamp', $today)->count(),
            'active_devices' => \App\Models\Device::where('last_sync_at', '>', now()->subMinutes(5))->count(),
        ];

        $latestMarks = AttendanceMark::with('device') // Traemos el nombre del dispositivo
            ->orderBy('timestamp', 'desc')
            ->take(10) // Solo las últimas 10
            ->get()
            ->map(function ($mark) {
                return [
                    'id' => $mark->id,
                    'rut' => $mark->employee_rut,
                    'tipo' => $mark->type === 'in' ? 'Entrada' : 'Salida',
                    'hora' => Carbon::parse($mark->timestamp)->format('H:i:s'),
                    'dispositivo' => $mark->device->name ?? 'N/A',
                ];
            });

        return Inertia::render('Dashboard', [
            'summary' => $summary,
            'latestMarks' => $latestMarks, // <--- Nueva prop
            'date' => $today->toDateString(),
        ]);
    }
}
