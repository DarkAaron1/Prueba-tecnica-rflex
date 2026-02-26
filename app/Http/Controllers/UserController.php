<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Employee;
use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Hash;
use App\Http\Middleware\CheckRole;


class UserController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Admin/Users/Index', [
            'auth' => [
                'user' => $request->user(),
            ],
            'users' => User::with('employee.area.branch.company')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Users/Create', [
            // Enviamos las áreas con su jerarquía para el selector
            'areas' => Area::with('branch.company.holding')->get()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'role' => 'required|in:admin,manager,employee',
            'rut' => 'required|string',
            'area_id' => 'required_if:role,employee,manager'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'rut' => $request->rut,
        ]);

        if ($request->role !== 'admin') {
            Employee::create([
                'user_id' => $user->id,
                'area_id' => $request->area_id,
                'rut' => str_replace(['.', '-'], '', $request->rut),
                'phone' => $request->phone ?? '',
            ]);
        }

        return redirect()->route('admin.users.index')->with('success', 'Usuario creado correctamente');
    }
}