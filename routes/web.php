<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Asistencia;
use App\Http\Controllers\HoldingController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BranchController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Pantalla de Bienvenida
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Panel Principal (Dashboard)
Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

// --- GRUPO DE ADMINISTRACIÓN (Gestores) ---
// Protegido por autenticación y el middleware de rol admin que creamos
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    
    // Gestores Estructurales
    Route::resource('holdings', HoldingController::class);
    Route::resource('companies', CompanyController::class);
    Route::resource('areas', AreaController::class); // Esta es la ruta para áreas
    Route::resource('branches', BranchController::class); // Rutas para sucursales
    // Gestor de Usuarios
    Route::resource('users', UserController::class);

    // Rutas de Asistencia (Vistas Administrativas)
    Route::get('/marcas', [Asistencia::class, 'index'])->name('admin.marcas');
    Route::get('/turnos', [Asistencia::class, 'turnos'])->name('admin.turnos');
    Route::post('/conciliar/{shift_id}', [Asistencia::class, 'conciliar'])->name('admin.conciliar');
});

// Rutas de Perfil (Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';