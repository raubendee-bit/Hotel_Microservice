<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('housekeeping_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('room_id');
            $table->string('room_number');
            $table->unsignedBigInteger('housekeeper_id')->nullable();
            $table->string('housekeeper_name')->nullable();
            $table->string('task_description');
            $table->string('status')->default('Cleaned'); // Pending Cleanup, Cleaned, Maintenance
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('housekeeping_logs');
    }
};
