<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RoomCharge extends Model
{
    protected $table = 'room_charges';

    protected $fillable = [
        'invoice_id',
        'charge_description',
        'amount'
    ];
}
