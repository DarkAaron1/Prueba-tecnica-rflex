<?php

namespace App\Http\Controllers;

use App\Models\Branch;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Branches/index', [
            'branches' => Branch::with('company.holding')->get(),
            'companies' => Company::all()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'company_id' => 'required|exists:companies,id',
        ]);

        Branch::create($validated);
        return back()->with('message', 'Sucursal creada con éxito');
    }

    public function update(Request $request, Branch $branch)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'company_id' => 'required|exists:companies,id',
        ]);

        $branch->update($validated);
        return back()->with('message', 'Sucursal actualizada');
    }

    public function destroy(Branch $branch)
    {
        $branch->delete();
        return back()->with('message', 'Sucursal eliminada');
    }
}