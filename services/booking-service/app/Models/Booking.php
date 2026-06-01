<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $table = 'bookings';

    protected $fillable = [
        'guest_id',
        'guest_name',
        'guest_email',
        'room_id',
        'check_in_date',
        'check_out_date',
        'price_at_booking',
        'status' // Pending, Confirmed, Cancelled, Completed
    ];

    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}
