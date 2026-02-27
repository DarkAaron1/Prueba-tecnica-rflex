<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
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
            // Cargamos toda la cadena para que el frontend sepa a qué Holding/Empresa pertenece el empleado
            'users' => User::with(['employee.area', 'employee.branch.company.holding'])->get(),
            'holdings' => Holding::with('companies.branches.areas')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'role'      => 'required|in:admin,manager,employee',
            'rut'       => 'required|string',
            'phone'     => 'nullable|string',
            'branch_id' => 'required_if:role,employee,manager|exists:branches,id',
            'area_id'   => 'required_if:role,employee,manager|exists:areas,id'
        ]);

        $cleanRut = str_replace(['.', '-'], '', $request->rut);

        try {
            DB::transaction(function () use ($validated, $cleanRut) {
                $user = User::create([
                    'name'     => $validated['name'],
                    'email'    => $validated['email'],
                    'password' => Hash::make($cleanRut),
                    'role'     => $validated['role'],
                ]);

                if ($validated['role'] !== 'admin') {
                    Employee::create([
                        'user_id'   => $user->id,
                        'branch_id' => $validated['branch_id'],
                        'area_id'   => $validated['area_id'],
                        'rut'       => $cleanRut,
                        'phone'     => $validated['phone'] ?? '',
                    ]);
                }
            });
            return redirect()->back()->with('message', 'Usuario creado correctamente.');
        } catch (\Exception $e) {
            Log::error("Error: " . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Error al crear usuario.']);
        }
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'role'      => 'required|in:admin,manager,employee',
            'rut'       => 'required|string',
            'phone'     => 'nullable|string',
            'branch_id' => 'required_if:role,employee,manager',
            'area_id'   => 'required_if:role,employee,manager'
        ]);

        $cleanRut = str_replace(['.', '-'], '', $request->rut);

        DB::transaction(function () use ($validated, $user, $cleanRut, $request) {
            $userData = ['name' => $validated['name'], 'email' => $validated['email'], 'role' => $validated['role']];
            if ($request->filled('password')) {
                $userData['password'] = Hash::make($request->password);
            }
            $user->update($userData);

            if ($validated['role'] !== 'admin') {
                $user->employee()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'branch_id' => $validated['branch_id'],
                        'area_id'   => $validated['area_id'],
                        'rut'       => $cleanRut,
                        'phone'     => $validated['phone'] ?? '',
                    ]
                );
            } else {
                $user->employee()->delete();
            }
        });
        return redirect()->back()->with('message', 'Usuario actualizado.');
    }

    public function destroy(User $user)
    {
        $user->delete();
        return back()->with('message', 'Usuario eliminado.');
    }
}