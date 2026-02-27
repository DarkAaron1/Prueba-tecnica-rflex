<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
{
    if ($request->user()->must_change_password) {
        // Redirigir a una vista especial de "Cambio de clave obligatorio"
        return Inertia::render('Auth/ForcePasswordChange');
    }

    return Inertia::render('Dashboard', [
        'user' => $request->user()
    ]);
}
}
