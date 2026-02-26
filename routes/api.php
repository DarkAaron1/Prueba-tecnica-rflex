<?php
/*
|------------Ruta original----------------
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
|-----------------------------------------
*/
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Asistencia;
use App\Http\Controllers\Api\DashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Agrupamos por versión para buenas prácticas de API
Route::prefix('v1')->group(function () {

    // 1. Endpoints para los Relojes Biométricos (Públicos o con Token de Dispositivo)
    Route::post('/marcas', [Asistencia::class, 'store']);

    // 2. Endpoints para el Dashboard de React
    //Route::prefix('admin')->middleware('auth:sanctum')->group(function () { 
    Route::prefix('admin')->group(function () { // Temporal para Postman        Route::get('/resumen', [DashboardController::class, 'getSummary']);
        Route::get('/marcas', [Asistencia::class, 'index']);
        Route::get('/marcas/{id}', [Asistencia::class, 'show']);
        Route::get('/turnos', [Asistencia::class, 'turnos']);
        Route::post('/conciliar/{shift_id}', [Asistencia::class, 'conciliar']);
    });

});