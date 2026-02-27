<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Asistencia;
use App\Http\Controllers\HoldingController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\AreaController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BranchController;
use App\Http\Controllers\ShiftPlanningController;
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
    Route::resource('holdings', HoldingController::class); // Rutas para holdings
    Route::resource('companies', CompanyController::class); // Rutas para compañías
    Route::resource('areas', AreaController::class); // Esta es la ruta para áreas
    Route::resource('branches', BranchController::class); // Rutas para sucursales
    Route::resource('users', UserController::class); // Rutas para usuarios
    // Rutas de Planificación de Turnos
    Route::get('/shifts/planning', [ShiftPlanningController::class, 'index'])
        ->name('shifts.planning');
    Route::post('/shifts/planning', [ShiftPlanningController::class, 'store'])
        ->name('shifts.planning.store');
    Route::put('/shifts/planning/{shift}', [ShiftPlanningController::class, 'update'])
        ->name('shifts.planning.update');
    Route::delete('/shifts/planning/{shift}', [ShiftPlanningController::class, 'destroy'])
        ->name('shifts.planning.destroy');
    Route::post('/shifts/planning/copy', [ShiftPlanningController::class, 'copy'])
        ->name('shifts.planning.copy');

    // Rutas de Asistencia (Vistas Administrativas)
    Route::get('/marcas', [Asistencia::class, 'index'])->name('admin.marcas');
    Route::get('/turnos', [Asistencia::class, 'turnos'])->name('admin.turnos');
    Route::post('/conciliar/{shift_id}', [Asistencia::class, 'conciliar'])->name('admin.conciliar');
});

// Rutas de Perfil (Breeze)
Route::middleware('auth')->group(function () {
    // Esta ruta es para que el usuario logueado vea sus propios turnos
    Route::get('/my-schedule', [ShiftPlanningController::class, 'mySchedule'])
        ->name('my.schedule');
        
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';