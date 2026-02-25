<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Jobs\ProcessAttendanceJob;

Schedule::job(ProcessAttendanceJob::class)->everyFiveMinutes(); /* Hace que el Job Se ejecute en el rango de tiempo */

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
