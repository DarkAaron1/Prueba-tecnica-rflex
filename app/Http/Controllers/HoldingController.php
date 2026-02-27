<?php

namespace App\Http\Controllers;

use App\Models\Holding;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HoldingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Holdings/index', [
            'holdings' => Holding::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:holdings,name',
        ]);

        Holding::create($validated);
        return back()->with('message', 'Holding creado con éxito');
    }

    public function update(Request $request, Holding $holding)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:holdings,name,' . $holding->id,
        ]);

        $holding->update($validated);
        return back()->with('message', 'Holding actualizado');
    }

    public function destroy(Holding $holding)
    {
        // Nota: Si hay compañías vinculadas, esto podría fallar por integridad referencial
        $holding->delete();
        return back()->with('message', 'Holding eliminado');
    }
}