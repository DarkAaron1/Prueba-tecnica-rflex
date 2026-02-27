<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Holding;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CompanyController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Companies/index', [
            // Cargamos la relación con el holding para mostrarlo en la tabla
            'companies' => Company::with('holding')->get(),
            'holdings' => Holding::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|unique:companies,rut',
            'holding_id' => 'required|exists:holdings,id',
        ]);

        Company::create($validated);
        return back()->with('message', 'Compañía creada con éxito');
    }

    public function update(Request $request, Company $company)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'rut' => 'required|string|unique:companies,rut,' . $company->id,
            'holding_id' => 'required|exists:holdings,id',
        ]);

        $company->update($validated);
        return back()->with('message', 'Compañía actualizada');
    }

    public function destroy(Company $company)
    {
        // Nota: Laravel lanzará un error si intentas eliminar una compañía con sucursales 
        // vinculadas si tienes restricciones de llave foránea (lo cual es bueno).
        $company->delete();
        return back()->with('message', 'Compañía eliminada');
    }
}