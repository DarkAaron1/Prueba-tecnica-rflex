<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use App\Models\Area;
use App\Models\Holding;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Users/index', [
            'users' => User::with(['employee.area.branch.company.holding'])->get(),
            // Estructura completa para los selectores dinámicos en el frontend
            'holdings' => Holding::with('companies.branches.areas')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'role'     => 'required|in:admin,manager,employee',
            'rut'      => 'required|string',
            'phone'    => 'nullable|string',
            'area_id'  => 'required_if:role,employee,manager|exists:areas,id'
        ]);

        // Limpieza de RUT (quitar puntos y guion)
        $cleanRut = str_replace(['.', '-'], '', $request->rut);

        try {
            DB::transaction(function () use ($validated, $cleanRut) {
                // 1. Crear el Usuario
                $user = User::create([
                    'name'     => $validated['name'],
                    'email'    => $validated['email'],
                    'password' => Hash::make($cleanRut), // Pass default = RUT
                    'role'     => $validated['role'],
                    'must_change_password' => true, // Bandera para futuras versiones
                ]);

                // 2. Crear Perfil de Empleado (si no es admin)
                if ($validated['role'] !== 'admin') {
                    Employee::create([
                        'user_id' => $user->id,
                        'area_id' => $validated['area_id'],
                        'rut'     => $cleanRut,
                        'phone'   => $validated['phone'] ?? '',
                    ]);
                }
            });

            return redirect()->back()->with('message', "Usuario creado. Clave inicial: $cleanRut");

        } catch (\Exception $e) {
            Log::error("Error creando usuario: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'No se pudo crear el usuario.']);
        }
    }

    public function resetPassword(User $user)
    {
        // Priorizar el RUT del empleado, si no, usar uno genérico o el nombre
        $cleanRut = $user->employee ? $user->employee->rut : '12345678';

        $user->update([
            'password' => Hash::make($cleanRut),
            'must_change_password' => true
        ]);

        return back()->with('message', "Contraseña de {$user->name} reestablecida al RUT.");
    }

    public function destroy(User $user)
    {
        // Al eliminar el usuario, se elimina el empleado por cascada (si está configurado en DB)
        $user->delete();
        return back()->with('message', 'Usuario eliminado correctamente.');
    }

    public function update(Request $request, User $user)
{
    $validated = $request->validate([
        'name'     => 'required|string|max:255',
        'email'    => 'required|email|unique:users,email,' . $user->id,
        'role'     => 'required|in:admin,manager,employee',
        'rut'      => 'required|string',
        'phone'    => 'nullable|string',
        'area_id'  => 'required_if:role,employee,manager'
    ]);

    $cleanRut = str_replace(['.', '-'], '', $request->rut);

    DB::transaction(function () use ($validated, $user, $cleanRut, $request) {
        // 1. Actualizar Usuario
        $userData = [
            'name'  => $validated['name'],
            'email' => $validated['email'],
            'role'  => $validated['role'],
        ];

        // Solo actualizar password si se envió una nueva
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->password);
        }

        $user->update($userData);

        // 2. Actualizar o Crear Perfil de Empleado
        if ($validated['role'] !== 'admin') {
            $user->employee()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'area_id' => $validated['area_id'],
                    'rut'     => $cleanRut,
                    'phone'   => $validated['phone'] ?? '',
                ]
            );
        } else {
            // Si el usuario pasó a ser Admin, eliminamos su perfil de empleado si existía
            $user->employee()->delete();
        }
    });

    return redirect()->back()->with('message', 'Usuario actualizado con éxito');
}
}