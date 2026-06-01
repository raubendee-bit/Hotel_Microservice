<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invoice extends Model
{
    protected $table = 'invoices';

    protected $fillable = [
        'booking_id',
        'guest_id',
        'guest_name',
        'guest_email',
        'subtotal',
        'tax',
        'total_amount',
        'payment_status' // Unpaid, Paid
    ];

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function roomCharges()
    {
        return $this->hasMany(RoomCharge::class);
    }
}
