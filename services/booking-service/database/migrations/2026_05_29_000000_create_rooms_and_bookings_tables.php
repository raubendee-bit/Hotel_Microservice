<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->string('room_number')->unique();
            $table->string('style'); // Standard, Deluxe, Family, Business Suite
            $table->string('status')->default('Available'); // Available, Occupied, Dirty, Maintenance
            $table->decimal('price_per_night', 10, 2);
            $table->string('room_key')->nullable();
            $table->timestamps();
        });

        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('guest_id');
            $table->string('guest_name');
            $table->string('guest_email');
            $table->unsignedBigInteger('room_id');
            $table->date('check_in_date');
            $table->date('check_out_date');
            $table->decimal('price_at_booking', 10, 2);
            $table->string('status')->default('Pending'); // Pending, Confirmed, Cancelled, Completed
            $table->timestamps();

            $table->foreign('room_id')->references('id')->on('rooms')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
        Schema::dropIfExists('rooms');
    }
};
