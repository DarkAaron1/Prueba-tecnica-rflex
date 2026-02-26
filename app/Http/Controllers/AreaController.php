<?php

namespace App\Http\Controllers;

use App\Models\Area;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Area/Index', [
            // Cargamos la jerarquía completa: Área -> Sucursal -> Compañía -> Holding
            'areas' => Area::with(['branch.company.holding'])->get(),
            // Enviamos las Sucursales (Branches) para el selector del formulario
            'branches' => \App\Models\Branch::with('company')->get(),
        ]);
    }

    public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'branch_id' => 'required|exists:branches,id', // Cambiado de company_id
    ]);

    Area::create($validated);
    
    return redirect()->back()->with('message', 'Área creada con éxito');
}
}