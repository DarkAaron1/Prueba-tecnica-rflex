<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Area;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeviceController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Devices/index', [
            'devices' => Device::with('area')->get()->map(function ($device) {
                return [
                    'id' => $device->id,
                    'name' => $device->name,
                    'serial_number' => $device->serial_number,
                    'type' => $device->type, // 'biometric', 'gateway', 'virtual'
                    'area_name' => $device->area->name ?? 'Sin Área',
                    'area_id' => $device->area_id,
                    'last_sync' => $device->last_sync_at ? $device->last_sync_at->diffForHumans() : 'Nunca',
                    'is_online' => $device->last_sync_at ? $device->last_sync_at->diffInMinutes(now()) < 10 : false,
                ];
            }),
            'areas' => Area::all(['id', 'name']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'serial_number' => 'required|string|unique:devices,serial_number',
            'type' => 'required|in:biometric,gateway,virtual', // Coincide con tu ENUM
            'area_id' => 'required|exists:areas,id',
        ]);

        Device::create($validated);

        return back()->with('message', 'Dispositivo vinculado al área correctamente.');
    }

    public function update(Request $request, Device $device)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:biometric,gateway,virtual',
            'area_id' => 'required|exists:areas,id',
        ]);

        $device->update($validated);
        return back();
    }

    public function destroy(Device $device)
    {
        $device->delete();
        return back();
    }
}