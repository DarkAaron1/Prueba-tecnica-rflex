<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Holding;
use App\Models\Company;
use App\Models\Branch;
use App\Models\Area;
use App\Models\Device;
use App\Models\User;
use App\Models\Employee;
use App\Models\Shift;
use App\Models\AttendanceMark;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class Pruebas1_seeder extends Seeder
{
    public function run(): void
    {
        $baseDate = Carbon::today(); // Configurable

        // 1. Estructura Organizacional Expandida
        $holding = Holding::create(['name' => 'Corporación Global Chile']);

        $company = Company::create([
            'holding_id' => $holding->id,
            'name' => 'Tecnología e Innovación Ltda',
            'rut' => '77.666.555-4'
        ]);

        $branch = Branch::create([
            'company_id' => $company->id,
            'name' => 'Casa Matriz - Santiago',
            'address' => 'Av. Providencia 1234'
        ]);

        $areas = [
            Area::create(['branch_id' => $branch->id, 'name' => 'Desarrollo']),
            Area::create(['branch_id' => $branch->id, 'name' => 'Diseño']),
        ];

        $devices = [
            Device::create([
                'area_id' => $areas[0]->id,
                'serial_number' => 'ZKT-9000-X',
                'name' => 'Reloj Entrada Principal',
                'type' => 'biometric',
                'last_sync_at' => now()
            ]),
            Device::create([
                'area_id' => $areas[1]->id,
                'serial_number' => 'GW-001',
                'name' => 'Gateway Diseño',
                'type' => 'gateway',
                'last_sync_at' => now()
            ]),
        ];

        // 2. Escenarios de Empleados Expandidos
        $scenarios = [
            ['name' => 'Juan Pérez', 'rut' => '11.111.111-1', 'area' => $areas[0], 'scheduled_in' => '08:00', 'actual_in' => '08:05', 'actual_out' => '17:00', 'status' => 'present', 'phone' => '+56912345678'],
            ['name' => 'María García', 'rut' => '22.222.222-2', 'area' => $areas[0], 'scheduled_in' => '08:00', 'actual_in' => '08:45', 'actual_out' => '17:30', 'status' => 'late', 'phone' => '+56987654321'],
            ['name' => 'Pedro Soto', 'rut' => '33.333.333-3', 'area' => $areas[1], 'scheduled_in' => '08:00', 'actual_in' => null, 'actual_out' => null, 'status' => 'pending', 'phone' => '+56911223344'],
            ['name' => 'Ana López', 'rut' => '44.444.444-4', 'area' => $areas[1], 'scheduled_in' => '08:00', 'actual_in' => '07:50', 'actual_out' => '16:30', 'status' => 'early_departure', 'phone' => '+56955667788'],
            ['name' => 'Carlos Ruiz', 'rut' => '55.555.555-5', 'area' => $areas[0], 'scheduled_in' => '08:00', 'actual_in' => '08:00', 'actual_out' => '18:00', 'status' => 'present', 'phone' => '+56999887766'],
        ];

        foreach ($scenarios as $scenario) {
            $this->createEmployeeScenario($scenario, $baseDate, $devices);
        }

        $this->command->info('Seeder completado: ' . count($scenarios) . ' empleados creados.');
    }

    private function createEmployeeScenario($scenario, $baseDate, $devices)
    {
        $user = User::create([
            'name' => $scenario['name'],
            'email' => strtolower(explode(' ', $scenario['name'])[0]) . '@test.com',
            'role' => 'employee',
            'rut' => $scenario['rut'],
            'password' => Hash::make('password'),
        ]);

        $employee = Employee::create([
            'user_id' => $user->id,
            'area_id' => $scenario['area']->id,
            'rut' => str_replace(['.', '-'], '', $scenario['rut']),
            'phone' => $scenario['phone'],
        ]);

        $scheduledIn = $baseDate->copy()->setTimeFromTimeString($scenario['scheduled_in']);
        $scheduledOut = $baseDate->copy()->setHour(17)->setMinute(0);

        $shift = Shift::create([
            'employee_id' => $employee->id,
            'scheduled_in' => $scheduledIn,
            'scheduled_out' => $scheduledOut,
            'status' => $scenario['status']
        ]);

        $device = $devices[array_rand($devices)]; // Asignar device aleatorio

        if ($scenario['actual_in']) {
            AttendanceMark::create([
                'employee_rut' => $employee->rut,
                'device_id' => $device->id,
                'type' => 'in',
                'timestamp' => $baseDate->copy()->setTimeFromTimeString($scenario['actual_in']),
                'source' => 'clock',
                'metadata' => ['lat' => -33.4489, 'lng' => -70.6693] // Ejemplo GPS
            ]);
        }

        if ($scenario['actual_out']) {
            AttendanceMark::create([
                'employee_rut' => $employee->rut,
                'device_id' => $device->id,
                'type' => 'out',
                'timestamp' => $baseDate->copy()->setTimeFromTimeString($scenario['actual_out']),
                'source' => 'clock',
                'metadata' => ['lat' => -33.4489, 'lng' => -70.6693]
            ]);
        }
        // Crear Admin Global
        User::create([
            'name' => 'Admin Sistema',
            'email' => 'admin@test.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'rut' => '99.999.999-9'
        ]);

        // Crear un Jefe de Área (Manager)
        $managerUser = User::create([
            'name' => 'Jefe de Desarrollo',
            'email' => 'jefe@test.com',
            'password' => Hash::make('password'),
            'role' => 'manager',
            'rut' => '88.888.888-8'
        ]);

        // El Jefe también debe ser empleado para estar en el organigrama
        Employee::create([
            'user_id' => $managerUser->id,
            'area_id' => $scenario['area']->id,
            'rut' => '888888888',
            'phone' => '+56900000000',
        ]);
    }
}