<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HousekeepingController;

Route::middleware(\App\Http\Middleware\VerifyMicroserviceJwt::class)->group(function () {
    Route::get('/logs', [HousekeepingController::class, 'getLogs']);
    Route::post('/logs', [HousekeepingController::class, 'createLog']);
});
