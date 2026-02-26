<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\AttendanceMark;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Obtener resumen general para el dashboard.
     * GET /api/v1/admin/resumen
     */
    public function getSummary(Request $request)
    {
        $today = Carbon::today();

        // Total empleados activos
        $totalEmployees = Employee::count();

        // Turnos de hoy
        $todayShifts = Shift::whereDate('scheduled_in', $today)->count();

        // Turnos presentes hoy
        $presentToday = Shift::whereDate('scheduled_in', $today)
            ->where('status', 'present')
            ->count();

        // Ausencias hoy
        $absentToday = Shift::whereDate('scheduled_in', $today)
            ->where('status', 'absent')
            ->count();

        // Atrasos hoy
        $lateToday = Shift::whereDate('scheduled_in', $today)
            ->where('status', 'late')
            ->count();

        // Marcas registradas hoy
        $marksToday = AttendanceMark::whereDate('timestamp', $today)->count();

        // Dispositivos activos (última sync < 5 min)
        $activeDevices = \App\Models\Device::where('last_sync_at', '>', now()->subMinutes(5))->count();

        return response()->json([
            'summary' => [
                'total_employees' => $totalEmployees,
                'shifts_today' => $todayShifts,
                'present_today' => $presentToday,
                'absent_today' => $absentToday,
                'late_today' => $lateToday,
                'marks_today' => $marksToday,
                'active_devices' => $activeDevices,
            ],
            'date' => $today->toDateString(),
        ]);
    }
}
