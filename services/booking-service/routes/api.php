<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\BookingController;

Route::middleware(\App\Http\Middleware\VerifyMicroserviceJwt::class)->group(function () {
    Route::get('/rooms', [BookingController::class, 'getRooms']);
    Route::put('/rooms/{roomId}/status', [BookingController::class, 'updateRoomStatus']);
    
    Route::get('/bookings', [BookingController::class, 'getBookings']);
    Route::post('/bookings', [BookingController::class, 'createBooking']);
    Route::post('/{bookingId}/cancel', [BookingController::class, 'cancelBooking']);
    
    Route::post('/{bookingId}/checkin', [BookingController::class, 'checkIn']);
    Route::post('/{bookingId}/checkout', [BookingController::class, 'checkOut']);
});
