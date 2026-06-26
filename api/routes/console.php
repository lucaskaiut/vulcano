<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('vulcano:check-expiring-exams')->dailyAt('08:00');
Schedule::command('vulcano:check-expiring-documents')->dailyAt('08:00');
