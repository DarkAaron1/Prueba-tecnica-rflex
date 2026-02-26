<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Asistencia;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

Route::middleware('auth')->group(function () {
    // Rutas para ver datos desde el panel administrativo de React
    Route::get('/admin/marcas', [Asistencia::class, 'index'])->name('admin.marcas');
    Route::get('/admin/turnos', [Asistencia::class, 'turnos'])->name('admin.turnos');
    Route::post('/admin/conciliar/{shift_id}', [Asistencia::class, 'conciliar'])->name('admin.conciliar');
    
    // Rutas de perfil generadas por Breeze
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // ...
});

require __DIR__.'/auth.php';
