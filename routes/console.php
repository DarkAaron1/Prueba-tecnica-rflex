<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\ProcesoDeAusencia;
use App\Jobs\ProcesoDeAsistencia;

Schedule::job(ProcesoDeAusencia::class)->everyFiveMinutes(); /* Hace que el Job Se ejecute en el rango de tiempo */
Schedule::job(ProcesoDeAsistencia::class)->dailyAt('00:00'); /* Hace que el Job Se ejecute en el rango de tiempo */

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
