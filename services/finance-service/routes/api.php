<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\FinanceController;

Route::middleware(\App\Http\Middleware\VerifyMicroserviceJwt::class)->group(function () {
    Route::get('/invoices', [FinanceController::class, 'getInvoices']);
    Route::post('/invoices', [FinanceController::class, 'createInvoice']);
    Route::get('/invoices/{id}', [FinanceController::class, 'getInvoiceById']);
    Route::get('/invoices/booking/{bookingId}', [FinanceController::class, 'getInvoiceByBooking']);
    Route::post('/invoices/{id}/charges', [FinanceController::class, 'addRoomCharge']);
    Route::post('/invoices/{id}/pay', [FinanceController::class, 'payInvoice']);
    Route::get('/analytics', [FinanceController::class, 'getAnalytics']);
});
