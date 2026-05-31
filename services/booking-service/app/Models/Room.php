<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    protected $table = 'rooms';

    protected $fillable = [
        'room_number',
        'style', // Standard, Deluxe, Family, Business Suite
        'status', // Available, Occupied, Dirty, Maintenance
        'price_per_night',
        'room_key' // Barcode or code assigned
    ];
}
